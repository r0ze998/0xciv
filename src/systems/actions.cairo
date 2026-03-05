use dojo_starter::models::{ResourceType, AgentAction, GamePhase};

#[starknet::interface]
pub trait IActions<T> {
    // Game management
    fn start_game(ref self: T, total_turns: u32);
    fn advance_turn(ref self: T);

    // Player actions
    fn spawn_civilization(ref self: T);
    fn set_strategy(ref self: T, aggression: u8, trade_focus: u8, growth_focus: u8);

    // Agent actions (called by Daydreams agents or players)
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
}

#[dojo::contract]
pub mod actions {
    use dojo::event::EventStorage;
    use dojo::model::ModelStorage;
    use dojo_starter::models::{
        AgentAction, Civilization, GamePhase, GameState, PlayerCiv, ResourceType, Strategy,
        Territory, TradeProposal,
    };
    use starknet::{ContractAddress, get_caller_address};
    use super::IActions;

    // === Constants ===
    const GAME_ID: u32 = 1;
    const STARTING_FOOD: u128 = 100;
    const STARTING_METAL: u128 = 50;
    const STARTING_KNOWLEDGE: u128 = 25;
    const STARTING_MILITARY: u128 = 10;
    const BASE_GATHER_RATE: u128 = 10;
    const TERRITORY_BONUS: u128 = 5;
    const DEFEND_BONUS: u128 = 5;

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
        pub territory_x: u32,
        pub territory_y: u32,
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
    pub struct GameEnded {
        #[key]
        pub game_id: u32,
        pub winner_civ_id: u32,
    }

    // === Implementation ===

    #[abi(embed_v0)]
    impl ActionsImpl of IActions<ContractState> {
        fn start_game(ref self: ContractState, total_turns: u32) {
            let mut world = self.world_default();
            let game: GameState = world.read_model(GAME_ID);
            assert(game.game_phase == GamePhase::Setup, 'game already started');

            let new_game = GameState {
                game_id: GAME_ID,
                turn_number: 1,
                total_turns,
                game_phase: GamePhase::Running,
                civ_count: game.civ_count,
                next_trade_id: game.next_trade_id,
            };
            world.write_model(@new_game);
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

            game.turn_number += 1;

            if game.turn_number > game.total_turns {
                game.game_phase = GamePhase::Ended;
                let winner_id = find_winner(@world, game.civ_count);
                world.write_model(@game);
                world.emit_event(@GameEnded { game_id: GAME_ID, winner_civ_id: winner_id });
            } else {
                world.write_model(@game);
                world
                    .emit_event(
                        @TurnAdvanced { game_id: GAME_ID, turn_number: game.turn_number },
                    );
            }
        }

        fn spawn_civilization(ref self: ContractState) {
            let mut world = self.world_default();
            let caller = get_caller_address();

            // Check player hasn't already spawned
            let existing: PlayerCiv = world.read_model(caller);
            assert(existing.civ_id == 0, 'already spawned');

            let mut game: GameState = world.read_model(GAME_ID);
            game.civ_count += 1;
            let civ_id = game.civ_count;

            let civ = Civilization {
                civ_id,
                owner: caller,
                food: STARTING_FOOD,
                metal: STARTING_METAL,
                knowledge: STARTING_KNOWLEDGE,
                territory_count: 1,
                military_strength: STARTING_MILITARY,
                last_action: AgentAction::Gather,
                is_alive: true,
            };

            let strategy = Strategy { civ_id, aggression: 33, trade_focus: 33, growth_focus: 34 };

            // Assign starting territory based on civ_id
            let start_x = civ_id * 3;
            let start_y = civ_id * 3;
            let resource = match civ_id % 3 {
                0 => ResourceType::Knowledge,
                1 => ResourceType::Food,
                2 => ResourceType::Metal,
                _ => ResourceType::Food,
            };
            let territory = Territory {
                x: start_x, y: start_y, owner_civ_id: civ_id, resource_type: resource,
            };

            let player_civ = PlayerCiv { owner: caller, civ_id };

            world.write_model(@civ);
            world.write_model(@strategy);
            world.write_model(@territory);
            world.write_model(@player_civ);
            world.write_model(@game);

            world.emit_event(@CivSpawned { civ_id, owner: caller });
        }

        fn set_strategy(
            ref self: ContractState, aggression: u8, trade_focus: u8, growth_focus: u8,
        ) {
            let mut world = self.world_default();
            let caller = get_caller_address();
            let player_civ: PlayerCiv = world.read_model(caller);
            assert(player_civ.civ_id != 0, 'no civilization');

            let civ: Civilization = world.read_model(player_civ.civ_id);
            assert(civ.owner == caller, 'not your civ');
            assert(civ.is_alive, 'civ is dead');

            let strategy = Strategy {
                civ_id: player_civ.civ_id, aggression, trade_focus, growth_focus,
            };
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
            let boosted = production + (production * knowledge_bonus / 100);

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
            let attack_cost: u128 = 10;
            assert(attacker.metal >= attack_cost, 'not enough metal');
            attacker.metal -= attack_cost;

            // Defender gets bonus if last action was Defend
            let defender_bonus: u128 = if defender.last_action == AgentAction::Defend {
                DEFEND_BONUS
            } else {
                0
            };
            let def_strength = defender.military_strength + defender_bonus;

            // Pseudo-random from turn + civ ids
            let seed: u128 = game.turn_number.into()
                * 31
                + player_civ.civ_id.into()
                * 17
                + target_civ.into()
                * 13;
            let random_factor: u128 = seed % 20;

            let attacker_power = attacker.military_strength + random_factor;
            let attacker_won = attacker_power > def_strength;

            if attacker_won {
                // Transfer a territory
                if defender.territory_count > 0 {
                    let stolen_x = target_civ * 3;
                    let stolen_y = target_civ * 3 + (defender.territory_count - 1);
                    let mut terr: Territory = world.read_model((stolen_x, stolen_y));
                    if terr.owner_civ_id == target_civ {
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

                if defender.territory_count == 0 {
                    defender.is_alive = false;
                }
            } else {
                // Failed attack
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
                        territory_x: target_civ * 3,
                        territory_y: target_civ * 3,
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
            civ.last_action = AgentAction::Defend;

            world.write_model(@civ);

            world
                .emit_event(
                    @ActionPerformed {
                        civ_id: civ.civ_id, turn: game.turn_number, action: AgentAction::Defend,
                    },
                );
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

    fn find_winner(world: @dojo::world::WorldStorage, civ_count: u32) -> u32 {
        let mut best_id: u32 = 0;
        let mut best_score: u128 = 0;
        let mut i: u32 = 1;
        while i <= civ_count {
            let civ: Civilization = world.read_model(i);
            if civ.is_alive {
                let score = civ.food
                    + civ.metal
                    + civ.knowledge
                    + (civ.territory_count.into() * 50)
                    + civ.military_strength;
                if score > best_score {
                    best_score = score;
                    best_id = i;
                }
            }
            i += 1;
        };
        best_id
    }
}
