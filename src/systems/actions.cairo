use dojo_starter::models::ResourceType;

#[starknet::interface]
pub trait IActions<T> {
    // Game management
    fn create_game(ref self: T);
    fn advance_turn(ref self: T);

    // Player actions
    fn spawn_civilization(ref self: T);
    fn set_strategy(ref self: T, prompt_hash: felt252);

    // Agent actions (called by AI agents or players)
    fn gather(ref self: T);
    fn propose_trade(
        ref self: T,
        to_civ: u32,
        offer_type: ResourceType,
        offer_amount: u128,
        request_type: ResourceType,
        request_amount: u128,
    );
    fn accept_trade(ref self: T, trade_id: u32);
    fn attack(ref self: T, target_civ: u32);
    fn defend(ref self: T);
    fn check_elimination(ref self: T, civ_id: u32);

    // Query helpers
    fn get_tech_level(self: @T, knowledge: u128) -> u8;
}

#[dojo::contract]
pub mod actions {
    use dojo::event::EventStorage;
    use dojo::model::ModelStorage;
    use dojo_starter::models::{
        AgentAction, Civilization, GamePhase, GameState, PlayerCiv, RandomEventType, ResourceType,
        Strategy, Territory, TradeProposal, VictoryType,
    };
    use starknet::{ContractAddress, get_caller_address};
    use super::IActions;

    // === Constants ===
    const GAME_ID: u32 = 1;
    const GRID_SIZE: u32 = 5;
    const MAX_PLAYERS: u32 = 4;
    const STARTING_HP: u128 = 100;
    const STARTING_FOOD: u128 = 100;
    const STARTING_METAL: u128 = 50;
    const STARTING_KNOWLEDGE: u128 = 25;
    const STARTING_MILITARY: u128 = 10;
    const BASE_GATHER_RATE: u128 = 10;
    const TERRITORY_BONUS: u128 = 5;
    const DEFEND_BONUS: u128 = 5;
    const ATTACK_HP_DAMAGE: u128 = 20;
    const FAILED_ATTACK_HP_DAMAGE: u128 = 10;
    const ATTACK_METAL_COST: u128 = 10;

    // Tech thresholds (knowledge required)
    const TECH_AGRICULTURE: u128 = 15; // +2 food/gather
    const TECH_BRONZE_WORKING: u128 = 25; // +3 attack dmg
    const TECH_WRITING: u128 = 40; // +2 trade bonus
    const TECH_PHILOSOPHY: u128 = 60; // +3 HP/defend
    const TECH_ENGINEERING: u128 = 80; // capture rate +15%
    const TECH_ENLIGHTENMENT: u128 = 100; // all bonuses ×1.5

    // Turn mechanics
    const FOOD_DRAIN_PER_TURN: u128 = 3;
    const EVENT_FREQUENCY: u32 = 5; // random event every N turns

    // Victory thresholds
    const RESEARCH_VICTORY_THRESHOLD: u128 = 150;
    const ECONOMIC_VICTORY_THRESHOLD: u128 = 200;
    const ECONOMIC_VICTORY_MIN_TURN: u32 = 20;

    // === Events ===

    #[derive(Copy, Drop, Serde)]
    #[dojo::event]
    pub struct CivSpawned {
        #[key]
        pub civ_id: u32,
        pub owner: ContractAddress,
    }

    #[derive(Copy, Drop, Serde)]
    #[dojo::event]
    pub struct ActionPerformed {
        #[key]
        pub civ_id: u32,
        pub turn: u32,
        pub action: AgentAction,
    }

    #[derive(Copy, Drop, Serde)]
    #[dojo::event]
    pub struct CombatResult {
        #[key]
        pub attacker_civ: u32,
        pub defender_civ: u32,
        pub attacker_won: bool,
        pub hp_damage: u128,
    }

    #[derive(Copy, Drop, Serde)]
    #[dojo::event]
    pub struct TradeExecuted {
        #[key]
        pub trade_id: u32,
        pub from_civ: u32,
        pub to_civ: u32,
    }

    #[derive(Copy, Drop, Serde)]
    #[dojo::event]
    pub struct TurnAdvanced {
        #[key]
        pub game_id: u32,
        pub turn_number: u32,
    }

    #[derive(Copy, Drop, Serde)]
    #[dojo::event]
    pub struct CivEliminated {
        #[key]
        pub civ_id: u32,
        pub reason: felt252,
    }

    #[derive(Copy, Drop, Serde)]
    #[dojo::event]
    pub struct GameEnded {
        #[key]
        pub game_id: u32,
        pub winner_civ_id: u32,
    }

    #[derive(Copy, Drop, Serde)]
    #[dojo::event]
    pub struct VictoryAchieved {
        #[key]
        pub game_id: u32,
        pub winner_civ_id: u32,
        pub victory_type: VictoryType,
    }

    #[derive(Copy, Drop, Serde)]
    #[dojo::event]
    pub struct RandomEvent {
        #[key]
        pub game_id: u32,
        pub turn: u32,
        pub event_type: RandomEventType,
        pub affected_civ_id: u32,
        pub amount: u128,
    }

    // === Implementation ===

    #[abi(embed_v0)]
    impl ActionsImpl of IActions<ContractState> {
        fn create_game(ref self: ContractState) {
            let mut world = self.world_default();
            let game: GameState = world.read_model(GAME_ID);
            assert(game.game_phase == GamePhase::Setup, 'game already exists');
            assert(game.civ_count == 0, 'game already initialized');

            // Initialize 5x5 grid with resource types
            let mut x: u32 = 0;
            while x < GRID_SIZE {
                let mut y: u32 = 0;
                while y < GRID_SIZE {
                    let res_index = (x + y) % 3;
                    let resource = if res_index == 0 {
                        ResourceType::Food
                    } else if res_index == 1 {
                        ResourceType::Metal
                    } else {
                        ResourceType::Knowledge
                    };
                    let territory = Territory {
                        x, y, owner_civ_id: 0, resource_type: resource,
                    };
                    world.write_model(@territory);
                    y += 1;
                };
                x += 1;
            };

            let new_game = GameState {
                game_id: GAME_ID,
                turn_number: 0,
                game_phase: GamePhase::Setup,
                civ_count: 0,
                alive_count: 0,
                next_trade_id: 0,
            };
            world.write_model(@new_game);
        }

        fn spawn_civilization(ref self: ContractState) {
            let mut world = self.world_default();
            let caller = get_caller_address();

            // Check player hasn't already spawned
            let existing: PlayerCiv = world.read_model(caller);
            assert(existing.civ_id == 0, 'already spawned');

            let mut game: GameState = world.read_model(GAME_ID);
            assert(game.game_phase != GamePhase::Ended, 'game has ended');
            assert(game.civ_count < MAX_PLAYERS, 'game is full');

            game.civ_count += 1;
            game.alive_count += 1;
            let civ_id = game.civ_count;

            // Auto-start game when 2+ players have joined
            if game.civ_count >= 2 && game.game_phase == GamePhase::Setup {
                game.game_phase = GamePhase::Running;
                game.turn_number = 1;
            }

            // Assign corner positions on 5x5 grid
            let (start_x, start_y) = if civ_id == 1 {
                (0_u32, 0_u32)
            } else if civ_id == 2 {
                (4_u32, 0_u32)
            } else if civ_id == 3 {
                (0_u32, 4_u32)
            } else {
                (4_u32, 4_u32)
            };

            let civ = Civilization {
                civ_id,
                owner: caller,
                hp: STARTING_HP,
                food: STARTING_FOOD,
                metal: STARTING_METAL,
                knowledge: STARTING_KNOWLEDGE,
                territory_count: 1,
                military_strength: STARTING_MILITARY,
                last_action: AgentAction::Gather,
                is_alive: true,
            };

            let strategy = Strategy { civ_id, prompt_hash: 0 };

            // Claim starting territory
            let mut territory: Territory = world.read_model((start_x, start_y));
            territory.owner_civ_id = civ_id;

            let player_civ = PlayerCiv { owner: caller, civ_id };

            world.write_model(@civ);
            world.write_model(@strategy);
            world.write_model(@territory);
            world.write_model(@player_civ);
            world.write_model(@game);

            world.emit_event(@CivSpawned { civ_id, owner: caller });
        }

        fn set_strategy(ref self: ContractState, prompt_hash: felt252) {
            let mut world = self.world_default();
            let caller = get_caller_address();
            let player_civ: PlayerCiv = world.read_model(caller);
            assert(player_civ.civ_id != 0, 'no civilization');

            let civ: Civilization = world.read_model(player_civ.civ_id);
            assert(civ.owner == caller, 'not your civ');
            assert(civ.is_alive, 'civ is dead');

            let strategy = Strategy { civ_id: player_civ.civ_id, prompt_hash };
            world.write_model(@strategy);
        }

        fn gather(ref self: ContractState) {
            let mut world = self.world_default();
            let (_, game, player_civ) = validate_action(@world);
            let mut civ: Civilization = world.read_model(player_civ.civ_id);
            assert(civ.is_alive, 'civ is dead');

            // Base production + bonus per territory
            let production = BASE_GATHER_RATE + (civ.territory_count.into() * TERRITORY_BONUS);

            // Knowledge boosts gathering (up to +40%)
            let knowledge_bonus = if civ.knowledge > 100 {
                40_u128
            } else {
                civ.knowledge * 40 / 100
            };
            let mut boosted = production + (production * knowledge_bonus / 100);

            // Tech: Agriculture (+2)
            if civ.knowledge >= TECH_AGRICULTURE {
                boosted += 2;
            }

            // Tech: Enlightenment (×1.5)
            if civ.knowledge >= TECH_ENLIGHTENMENT {
                boosted = boosted * 3 / 2;
            }

            civ.food += boosted;
            civ.metal += boosted / 2;
            civ.knowledge += boosted / 4;
            civ.last_action = AgentAction::Gather;

            world.write_model(@civ);
            world
                .emit_event(
                    @ActionPerformed {
                        civ_id: civ.civ_id, turn: game.turn_number, action: AgentAction::Gather,
                    },
                );
        }

        fn propose_trade(
            ref self: ContractState,
            to_civ: u32,
            offer_type: ResourceType,
            offer_amount: u128,
            request_type: ResourceType,
            request_amount: u128,
        ) {
            let mut world = self.world_default();
            let (_, game, player_civ) = validate_action(@world);
            let civ: Civilization = world.read_model(player_civ.civ_id);
            assert(civ.is_alive, 'civ is dead');
            assert(player_civ.civ_id != to_civ, 'cannot trade with self');

            let target: Civilization = world.read_model(to_civ);
            assert(target.is_alive, 'target is dead');

            assert(has_resource(@civ, offer_type, offer_amount), 'insufficient resources');

            let mut game_state: GameState = world.read_model(GAME_ID);
            let trade_id = game_state.next_trade_id;
            game_state.next_trade_id += 1;

            let trade = TradeProposal {
                trade_id,
                from_civ: player_civ.civ_id,
                to_civ,
                offer_type,
                offer_amount,
                request_type,
                request_amount,
                is_active: true,
            };

            world.write_model(@trade);
            world.write_model(@game_state);

            let mut from_civ = civ;
            from_civ.last_action = AgentAction::Trade;
            world.write_model(@from_civ);

            world
                .emit_event(
                    @ActionPerformed {
                        civ_id: player_civ.civ_id,
                        turn: game.turn_number,
                        action: AgentAction::Trade,
                    },
                );
        }

        fn accept_trade(ref self: ContractState, trade_id: u32) {
            let mut world = self.world_default();
            let (_, _game, player_civ) = validate_action(@world);

            let mut trade: TradeProposal = world.read_model(trade_id);
            assert(trade.is_active, 'trade not active');
            assert(trade.to_civ == player_civ.civ_id, 'not trade recipient');

            let mut from_civ: Civilization = world.read_model(trade.from_civ);
            let mut to_civ: Civilization = world.read_model(trade.to_civ);
            assert(from_civ.is_alive, 'sender is dead');
            assert(to_civ.is_alive, 'receiver is dead');

            assert(has_resource(@from_civ, trade.offer_type, trade.offer_amount), 'sender lacks');
            assert(
                has_resource(@to_civ, trade.request_type, trade.request_amount), 'receiver lacks',
            );

            // Execute swap
            deduct_resource(ref from_civ, trade.offer_type, trade.offer_amount);
            add_resource(ref to_civ, trade.offer_type, trade.offer_amount);
            deduct_resource(ref to_civ, trade.request_type, trade.request_amount);
            add_resource(ref from_civ, trade.request_type, trade.request_amount);

            trade.is_active = false;
            to_civ.last_action = AgentAction::Trade;

            world.write_model(@from_civ);
            world.write_model(@to_civ);
            world.write_model(@trade);

            world
                .emit_event(
                    @TradeExecuted {
                        trade_id, from_civ: trade.from_civ, to_civ: trade.to_civ,
                    },
                );
        }

        fn attack(ref self: ContractState, target_civ: u32) {
            let mut world = self.world_default();
            let (_, game, player_civ) = validate_action(@world);
            let mut attacker: Civilization = world.read_model(player_civ.civ_id);
            let mut defender: Civilization = world.read_model(target_civ);
            assert(attacker.is_alive, 'attacker dead');
            assert(defender.is_alive, 'defender dead');
            assert(player_civ.civ_id != target_civ, 'cannot attack self');
            assert(attacker.military_strength > 0, 'no military');

            // Attack costs metal
            assert(attacker.metal >= ATTACK_METAL_COST, 'not enough metal');
            attacker.metal -= ATTACK_METAL_COST;

            // Defender gets bonus if last action was Defend + knowledge defense bonus
            let defend_action_bonus: u128 = if defender.last_action == AgentAction::Defend {
                DEFEND_BONUS
            } else {
                0
            };
            let knowledge_defense = defender.knowledge / 10;
            let def_strength = defender.military_strength + defend_action_bonus + knowledge_defense;

            // Pseudo-random from turn + civ ids
            let seed: u128 = game.turn_number.into()
                * 31
                + player_civ.civ_id.into()
                * 17
                + target_civ.into()
                * 13;
            let random_factor: u128 = seed % 20;

            // Tech: Bronze Working (+3 attack power)
            let tech_attack_bonus: u128 = if attacker.knowledge >= TECH_BRONZE_WORKING {
                3
            } else {
                0
            };

            let attacker_power = attacker.military_strength + random_factor + tech_attack_bonus;
            let attacker_won = attacker_power > def_strength;

            let mut hp_damage: u128 = 0;

            if attacker_won {
                // Damage defender HP
                hp_damage = ATTACK_HP_DAMAGE;
                if defender.hp > hp_damage {
                    defender.hp -= hp_damage;
                } else {
                    defender.hp = 0;
                }

                // Transfer a territory if defender has one
                // Tech: Engineering increases capture chance (always capture vs 60% base)
                let capture_roll: u128 = (seed * 7 + 3) % 100;
                let capture_threshold: u128 = if attacker.knowledge >= TECH_ENGINEERING {
                    100 // always capture
                } else {
                    60 // 60% base chance
                };
                if defender.territory_count > 0 && capture_roll < capture_threshold {
                    let (found, tx, ty) = find_territory_owned_by(@world, target_civ);
                    if found {
                        let mut terr: Territory = world.read_model((tx, ty));
                        terr.owner_civ_id = player_civ.civ_id;
                        world.write_model(@terr);
                        attacker.territory_count += 1;
                        defender.territory_count -= 1;
                    }
                }

                // Loot 25% of resources
                let loot_food = defender.food / 4;
                let loot_metal = defender.metal / 4;
                defender.food -= loot_food;
                defender.metal -= loot_metal;
                attacker.food += loot_food;
                attacker.metal += loot_metal;

                attacker.military_strength += 2;
                if defender.military_strength >= 3 {
                    defender.military_strength -= 3;
                } else {
                    defender.military_strength = 0;
                }
            } else {
                // Failed attack — attacker takes HP damage
                hp_damage = FAILED_ATTACK_HP_DAMAGE;
                if attacker.hp > hp_damage {
                    attacker.hp -= hp_damage;
                } else {
                    attacker.hp = 0;
                }

                if attacker.military_strength >= 2 {
                    attacker.military_strength -= 2;
                } else {
                    attacker.military_strength = 0;
                }
                defender.military_strength += 1;
            }

            attacker.last_action = AgentAction::Attack;

            world.write_model(@attacker);
            world.write_model(@defender);

            world
                .emit_event(
                    @CombatResult {
                        attacker_civ: player_civ.civ_id,
                        defender_civ: target_civ,
                        attacker_won,
                        hp_damage,
                    },
                );

            world
                .emit_event(
                    @ActionPerformed {
                        civ_id: player_civ.civ_id,
                        turn: game.turn_number,
                        action: AgentAction::Attack,
                    },
                );
        }

        fn defend(ref self: ContractState) {
            let mut world = self.world_default();
            let (_, game, player_civ) = validate_action(@world);
            let mut civ: Civilization = world.read_model(player_civ.civ_id);
            assert(civ.is_alive, 'civ is dead');

            // Convert metal to military
            let build_amount: u128 = if civ.metal >= 20 {
                5
            } else {
                civ.metal / 4
            };
            if civ.metal >= build_amount {
                civ.metal -= build_amount;
            }
            civ.military_strength += build_amount;

            // Tech: Philosophy (+3 HP heal)
            let tech_heal_bonus: u128 = if civ.knowledge >= TECH_PHILOSOPHY {
                3
            } else {
                0
            };

            // Knowledge-based heal: min(knowledge/10, 5)
            let knowledge_heal: u128 = if civ.knowledge / 10 > 5 {
                5
            } else {
                civ.knowledge / 10
            };

            // Defending recovers HP (base 5 + knowledge + tech)
            let heal_amount: u128 = 5 + knowledge_heal + tech_heal_bonus;
            if civ.hp < 100 {
                civ.hp += heal_amount;
                if civ.hp > 100 {
                    civ.hp = 100;
                }
            }

            civ.last_action = AgentAction::Defend;

            world.write_model(@civ);

            world
                .emit_event(
                    @ActionPerformed {
                        civ_id: civ.civ_id, turn: game.turn_number, action: AgentAction::Defend,
                    },
                );
        }

        fn get_tech_level(self: @ContractState, knowledge: u128) -> u8 {
            compute_tech_level(knowledge)
        }

        fn check_elimination(ref self: ContractState, civ_id: u32) {
            let mut world = self.world_default();
            let mut civ: Civilization = world.read_model(civ_id);

            if !civ.is_alive {
                return;
            }

            let mut reason: felt252 = 0;
            if civ.hp == 0 {
                reason = 'hp_zero';
            } else if civ.food == 0 {
                reason = 'starvation';
            } else if civ.territory_count == 0 {
                reason = 'no_territory';
            }

            if reason != 0 {
                civ.is_alive = false;
                world.write_model(@civ);

                let mut game: GameState = world.read_model(GAME_ID);
                if game.alive_count > 0 {
                    game.alive_count -= 1;
                }
                world.write_model(@game);

                world.emit_event(@CivEliminated { civ_id, reason });

                // Check if game should end (1 or fewer alive)
                if game.alive_count <= 1 && game.civ_count > 1 {
                    let mut g: GameState = world.read_model(GAME_ID);
                    g.game_phase = GamePhase::Ended;
                    let winner_id = find_last_alive(@world, g.civ_count);
                    world.write_model(@g);
                    world.emit_event(@GameEnded { game_id: GAME_ID, winner_civ_id: winner_id });
                }
            }
        }

        fn advance_turn(ref self: ContractState) {
            let mut world = self.world_default();
            let mut game: GameState = world.read_model(GAME_ID);
            assert(game.game_phase == GamePhase::Running, 'game not running');

            // Expire all active trades from the previous turn
            let mut i: u32 = 0;
            while i < game.next_trade_id {
                let trade: TradeProposal = world.read_model(i);
                if trade.is_active {
                    let expired = TradeProposal { is_active: false, ..trade };
                    world.write_model(@expired);
                }
                i += 1;
            };

            // Food drain for all alive civs
            let mut f: u32 = 1;
            while f <= game.civ_count {
                let mut civ: Civilization = world.read_model(f);
                if civ.is_alive {
                    if civ.food > FOOD_DRAIN_PER_TURN {
                        civ.food -= FOOD_DRAIN_PER_TURN;
                    } else {
                        civ.food = 0;
                    }
                    world.write_model(@civ);
                }
                f += 1;
            };

            game.turn_number += 1;

            // Random events (every EVENT_FREQUENCY turns)
            if game.turn_number > 1
                && game.turn_number % EVENT_FREQUENCY == 0 {
                apply_random_event(ref world, @game);
            }

            // Check elimination for all civs (after food drain + events)
            let mut j: u32 = 1;
            while j <= game.civ_count {
                let mut civ: Civilization = world.read_model(j);
                if civ.is_alive {
                    let mut reason: felt252 = 0;
                    if civ.hp == 0 {
                        reason = 'hp_zero';
                    } else if civ.food == 0 {
                        reason = 'starvation';
                    } else if civ.territory_count == 0 {
                        reason = 'no_territory';
                    }
                    if reason != 0 {
                        civ.is_alive = false;
                        world.write_model(@civ);
                        if game.alive_count > 0 {
                            game.alive_count -= 1;
                        }
                        world.emit_event(@CivEliminated { civ_id: j, reason });
                    }
                }
                j += 1;
            };

            // Check victory conditions
            let (victory_type, victor_id) = check_victory_conditions(
                @world, @game,
            );

            if victory_type != VictoryType::None {
                game.game_phase = GamePhase::Ended;
                world.write_model(@game);
                world
                    .emit_event(
                        @VictoryAchieved {
                            game_id: GAME_ID,
                            winner_civ_id: victor_id,
                            victory_type,
                        },
                    );
                world
                    .emit_event(
                        @GameEnded { game_id: GAME_ID, winner_civ_id: victor_id },
                    );
            } else if game.alive_count <= 1 && game.civ_count > 1 {
                // Domination: last civ standing
                game.game_phase = GamePhase::Ended;
                let winner_id = find_last_alive(@world, game.civ_count);
                world.write_model(@game);
                world
                    .emit_event(
                        @VictoryAchieved {
                            game_id: GAME_ID,
                            winner_civ_id: winner_id,
                            victory_type: VictoryType::Domination,
                        },
                    );
                world
                    .emit_event(
                        @GameEnded { game_id: GAME_ID, winner_civ_id: winner_id },
                    );
            } else {
                world.write_model(@game);
                world
                    .emit_event(
                        @TurnAdvanced { game_id: GAME_ID, turn_number: game.turn_number },
                    );
            }
        }
    }

    // === Internal helpers ===

    #[generate_trait]
    impl InternalImpl of InternalTrait {
        fn world_default(self: @ContractState) -> dojo::world::WorldStorage {
            self.world(@"dojo_starter")
        }
    }

    fn validate_action(
        world: @dojo::world::WorldStorage,
    ) -> (ContractAddress, GameState, PlayerCiv) {
        let caller = get_caller_address();
        let game: GameState = world.read_model(GAME_ID);
        assert(game.game_phase == GamePhase::Running, 'game not running');
        let player_civ: PlayerCiv = world.read_model(caller);
        assert(player_civ.civ_id != 0, 'no civilization');
        (caller, game, player_civ)
    }

    fn has_resource(civ: @Civilization, res_type: ResourceType, amount: u128) -> bool {
        match res_type {
            ResourceType::Food => *civ.food >= amount,
            ResourceType::Metal => *civ.metal >= amount,
            ResourceType::Knowledge => *civ.knowledge >= amount,
        }
    }

    fn deduct_resource(ref civ: Civilization, res_type: ResourceType, amount: u128) {
        match res_type {
            ResourceType::Food => { civ.food -= amount; },
            ResourceType::Metal => { civ.metal -= amount; },
            ResourceType::Knowledge => { civ.knowledge -= amount; },
        }
    }

    fn add_resource(ref civ: Civilization, res_type: ResourceType, amount: u128) {
        match res_type {
            ResourceType::Food => { civ.food += amount; },
            ResourceType::Metal => { civ.metal += amount; },
            ResourceType::Knowledge => { civ.knowledge += amount; },
        }
    }

    fn find_last_alive(world: @dojo::world::WorldStorage, civ_count: u32) -> u32 {
        let mut result: u32 = 0;
        let mut i: u32 = 1;
        while i <= civ_count {
            if result == 0 {
                let civ: Civilization = world.read_model(i);
                if civ.is_alive {
                    result = i;
                }
            }
            i += 1;
        };
        result
    }

    fn compute_tech_level(knowledge: u128) -> u8 {
        let mut level: u8 = 0;
        if knowledge >= TECH_AGRICULTURE {
            level += 1;
        }
        if knowledge >= TECH_BRONZE_WORKING {
            level += 1;
        }
        if knowledge >= TECH_WRITING {
            level += 1;
        }
        if knowledge >= TECH_PHILOSOPHY {
            level += 1;
        }
        if knowledge >= TECH_ENGINEERING {
            level += 1;
        }
        if knowledge >= TECH_ENLIGHTENMENT {
            level += 1;
        }
        level
    }

    fn check_victory_conditions(
        world: @dojo::world::WorldStorage, game: @GameState,
    ) -> (VictoryType, u32) {
        let civ_count = *game.civ_count;
        let turn = *game.turn_number;

        // Research victory: first civ to reach knowledge threshold
        let mut r: u32 = 1;
        while r <= civ_count {
            let civ: Civilization = world.read_model(r);
            if civ.is_alive && civ.knowledge >= RESEARCH_VICTORY_THRESHOLD {
                return (VictoryType::Research, r);
            }
            r += 1;
        };

        // Economic victory: first civ to reach total resource threshold (after min turn)
        if turn >= ECONOMIC_VICTORY_MIN_TURN {
            let mut e: u32 = 1;
            while e <= civ_count {
                let civ: Civilization = world.read_model(e);
                if civ.is_alive {
                    let total = civ.food + civ.metal + civ.knowledge;
                    if total >= ECONOMIC_VICTORY_THRESHOLD {
                        return (VictoryType::Economic, e);
                    }
                }
                e += 1;
            };
        }

        (VictoryType::None, 0)
    }

    fn apply_random_event(
        ref world: dojo::world::WorldStorage, game: @GameState,
    ) {
        let turn = *game.turn_number;
        let civ_count = *game.civ_count;

        // Pseudo-random from turn number
        let seed: u128 = turn.into() * 31 + 7;
        let event_roll: u128 = seed % 100;

        if event_roll < 25 {
            // Famine — all alive civs lose food
            let loss: u128 = (seed % 10) + 5;
            let mut k: u32 = 1;
            while k <= civ_count {
                let mut civ: Civilization = world.read_model(k);
                if civ.is_alive {
                    if civ.food > loss {
                        civ.food -= loss;
                    } else {
                        civ.food = 0;
                    }
                    world.write_model(@civ);
                }
                k += 1;
            };
            world
                .emit_event(
                    @RandomEvent {
                        game_id: GAME_ID,
                        turn,
                        event_type: RandomEventType::Famine,
                        affected_civ_id: 0,
                        amount: loss,
                    },
                );
        } else if event_roll < 50 {
            // Bounty — random civ gets bonus resources
            let target_idx: u32 = (seed % civ_count.into()).try_into().unwrap() + 1;
            let bonus: u128 = (seed % 15) + 10;
            let mut civ: Civilization = world.read_model(target_idx);
            if civ.is_alive {
                civ.food += bonus;
                civ.metal += bonus / 2;
                world.write_model(@civ);
            }
            world
                .emit_event(
                    @RandomEvent {
                        game_id: GAME_ID,
                        turn,
                        event_type: RandomEventType::Bounty,
                        affected_civ_id: target_idx,
                        amount: bonus,
                    },
                );
        } else if event_roll < 70 {
            // Plague — random civ loses HP
            let target_idx: u32 = (seed % civ_count.into()).try_into().unwrap() + 1;
            let dmg: u128 = (seed % 15) + 5;
            let mut civ: Civilization = world.read_model(target_idx);
            if civ.is_alive {
                if civ.hp > dmg {
                    civ.hp -= dmg;
                } else {
                    civ.hp = 1; // plague doesn't instantly kill
                }
                world.write_model(@civ);
            }
            world
                .emit_event(
                    @RandomEvent {
                        game_id: GAME_ID,
                        turn,
                        event_type: RandomEventType::Plague,
                        affected_civ_id: target_idx,
                        amount: dmg,
                    },
                );
        } else if event_roll < 85 {
            // Renaissance — all alive civs gain knowledge
            let gain: u128 = (seed % 8) + 3;
            let mut k: u32 = 1;
            while k <= civ_count {
                let mut civ: Civilization = world.read_model(k);
                if civ.is_alive {
                    civ.knowledge += gain;
                    world.write_model(@civ);
                }
                k += 1;
            };
            world
                .emit_event(
                    @RandomEvent {
                        game_id: GAME_ID,
                        turn,
                        event_type: RandomEventType::Renaissance,
                        affected_civ_id: 0,
                        amount: gain,
                    },
                );
        }
        // 15% chance: no event
    }

    fn find_territory_owned_by(
        world: @dojo::world::WorldStorage, civ_id: u32,
    ) -> (bool, u32, u32) {
        let mut result_x: u32 = 0;
        let mut result_y: u32 = 0;
        let mut found: bool = false;
        let mut x: u32 = 0;
        while x < GRID_SIZE {
            let mut y: u32 = 0;
            while y < GRID_SIZE {
                if !found {
                    let terr: Territory = world.read_model((x, y));
                    if terr.owner_civ_id == civ_id {
                        found = true;
                        result_x = x;
                        result_y = y;
                    }
                }
                y += 1;
            };
            x += 1;
        };
        (found, result_x, result_y)
    }
}
