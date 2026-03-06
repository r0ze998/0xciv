#[cfg(test)]
mod tests {
    use dojo::model::ModelStorage;
    use dojo::world::{WorldStorageTrait, world};
    use dojo_cairo_test::{
        ContractDef, ContractDefTrait, NamespaceDef, TestResource, WorldStorageTestTrait,
        spawn_test_world,
    };
    use dojo_starter::models::{
        GamePhase, GameState, m_Civilization, m_GameState, m_PlayerCiv, m_Strategy, m_Territory,
        m_TradeProposal,
    };
    use dojo_starter::systems::actions::{IActionsDispatcher, IActionsDispatcherTrait, actions};

    fn namespace_def() -> NamespaceDef {
        let ndef = NamespaceDef {
            namespace: "dojo_starter",
            resources: [
                TestResource::Model(m_Civilization::TEST_CLASS_HASH),
                TestResource::Model(m_GameState::TEST_CLASS_HASH),
                TestResource::Model(m_PlayerCiv::TEST_CLASS_HASH),
                TestResource::Model(m_Strategy::TEST_CLASS_HASH),
                TestResource::Model(m_Territory::TEST_CLASS_HASH),
                TestResource::Model(m_TradeProposal::TEST_CLASS_HASH),
                TestResource::Event(actions::e_CivSpawned::TEST_CLASS_HASH),
                TestResource::Event(actions::e_ActionPerformed::TEST_CLASS_HASH),
                TestResource::Event(actions::e_CombatResult::TEST_CLASS_HASH),
                TestResource::Event(actions::e_TradeExecuted::TEST_CLASS_HASH),
                TestResource::Event(actions::e_TurnAdvanced::TEST_CLASS_HASH),
                TestResource::Event(actions::e_CivEliminated::TEST_CLASS_HASH),
                TestResource::Event(actions::e_GameEnded::TEST_CLASS_HASH),
                TestResource::Contract(actions::TEST_CLASS_HASH),
            ]
                .span(),
        };

        ndef
    }

    fn contract_defs() -> Span<ContractDef> {
        [
            ContractDefTrait::new(@"dojo_starter", @"actions")
                .with_writer_of([dojo::utils::bytearray_hash(@"dojo_starter")].span())
        ]
            .span()
    }

    #[test]
    fn test_create_game() {
        let ndef = namespace_def();
        let mut world = spawn_test_world(world::TEST_CLASS_HASH, [ndef].span());
        world.sync_perms_and_inits(contract_defs());

        let (contract_address, _) = world.dns(@"actions").unwrap();
        let actions_system = IActionsDispatcher { contract_address };

        actions_system.create_game();

        let game: GameState = world.read_model(1_u32);
        assert(game.civ_count == 0, 'civ_count should be 0');
        assert(game.alive_count == 0, 'alive_count should be 0');
    }

    #[test]
    fn test_spawn_civilization() {
        let ndef = namespace_def();
        let mut world = spawn_test_world(world::TEST_CLASS_HASH, [ndef].span());
        world.sync_perms_and_inits(contract_defs());

        let (contract_address, _) = world.dns(@"actions").unwrap();
        let actions_system = IActionsDispatcher { contract_address };

        actions_system.create_game();
        actions_system.spawn_civilization();

        let game: GameState = world.read_model(1_u32);
        assert(game.civ_count == 1, 'civ_count should be 1');
        assert(game.alive_count == 1, 'alive_count should be 1');
    }

    #[test]
    fn test_spawn_sets_civ_alive() {
        let ndef = namespace_def();
        let mut world = spawn_test_world(world::TEST_CLASS_HASH, [ndef].span());
        world.sync_perms_and_inits(contract_defs());

        let (contract_address, _) = world.dns(@"actions").unwrap();
        let actions_system = IActionsDispatcher { contract_address };

        actions_system.create_game();
        actions_system.spawn_civilization();

        let civ: dojo_starter::models::Civilization = world.read_model(1_u32);
        assert(civ.is_alive, 'civ should be alive');
        assert(civ.hp > 0, 'hp should be > 0');
        assert(civ.food > 0, 'food should be > 0');
    }

    #[test]
    fn test_initial_resources() {
        let ndef = namespace_def();
        let mut world = spawn_test_world(world::TEST_CLASS_HASH, [ndef].span());
        world.sync_perms_and_inits(contract_defs());

        let (contract_address, _) = world.dns(@"actions").unwrap();
        let actions_system = IActionsDispatcher { contract_address };

        actions_system.create_game();
        actions_system.spawn_civilization();

        let civ: dojo_starter::models::Civilization = world.read_model(1_u32);
        assert(civ.hp == 100, 'hp should be 100');
        assert(civ.food == 100, 'food should be 100');
        assert(civ.metal == 50, 'metal should be 50');
        assert(civ.knowledge == 25, 'knowledge should be 25');
    }

    #[test]
    fn test_set_strategy() {
        let ndef = namespace_def();
        let mut world = spawn_test_world(world::TEST_CLASS_HASH, [ndef].span());
        world.sync_perms_and_inits(contract_defs());

        let (contract_address, _) = world.dns(@"actions").unwrap();
        let actions_system = IActionsDispatcher { contract_address };

        actions_system.create_game();
        actions_system.spawn_civilization();
        actions_system.set_strategy(0x1234);

        let strategy: dojo_starter::models::Strategy = world.read_model(1_u32);
        assert(strategy.prompt_hash == 0x1234, 'prompt hash mismatch');
    }

    #[test]
    fn test_two_civs_starts_game() {
        let ndef = namespace_def();
        let mut world = spawn_test_world(world::TEST_CLASS_HASH, [ndef].span());
        world.sync_perms_and_inits(contract_defs());

        let (contract_address, _) = world.dns(@"actions").unwrap();
        let actions_system = IActionsDispatcher { contract_address };

        actions_system.create_game();

        // Spawn first civ as default caller
        actions_system.spawn_civilization();

        // Switch caller to spawn second civ
        starknet::testing::set_contract_address(starknet::contract_address_const::<0x1234>());
        actions_system.spawn_civilization();

        let game: GameState = world.read_model(1_u32);
        assert(game.civ_count == 2, 'should have 2 civs');
        assert(game.alive_count == 2, 'should have 2 alive');
        // With 2+ civs, game phase transitions to Running (phase == 1)
        assert(game.game_phase == GamePhase::Running, 'should be Running');
    }

    #[test]
    fn test_gather_increases_resources() {
        let ndef = namespace_def();
        let mut world = spawn_test_world(world::TEST_CLASS_HASH, [ndef].span());
        world.sync_perms_and_inits(contract_defs());

        let (contract_address, _) = world.dns(@"actions").unwrap();
        let actions_system = IActionsDispatcher { contract_address };

        actions_system.create_game();
        actions_system.spawn_civilization();

        // Need 2nd civ to enter Running phase
        starknet::testing::set_contract_address(starknet::contract_address_const::<0x1234>());
        actions_system.spawn_civilization();

        // Switch back to civ 1's caller for gather
        starknet::testing::set_contract_address(starknet::contract_address_const::<0x0>());
        let civ_before: dojo_starter::models::Civilization = world.read_model(1_u32);
        let total_before = civ_before.food + civ_before.metal + civ_before.knowledge;

        actions_system.gather();

        let civ_after: dojo_starter::models::Civilization = world.read_model(1_u32);
        let total_after = civ_after.food + civ_after.metal + civ_after.knowledge;
        assert(total_after > total_before, 'resources should increase');
    }

    #[test]
    fn test_defend_restores_hp() {
        let ndef = namespace_def();
        let mut world = spawn_test_world(world::TEST_CLASS_HASH, [ndef].span());
        world.sync_perms_and_inits(contract_defs());

        let (contract_address, _) = world.dns(@"actions").unwrap();
        let actions_system = IActionsDispatcher { contract_address };

        actions_system.create_game();
        actions_system.spawn_civilization();

        starknet::testing::set_contract_address(starknet::contract_address_const::<0x1234>());
        actions_system.spawn_civilization();

        // Defend as civ 1
        starknet::testing::set_contract_address(starknet::contract_address_const::<0x0>());
        actions_system.defend();

        let civ: dojo_starter::models::Civilization = world.read_model(1_u32);
        // HP should still be 100 (can't exceed max), but defend should not error
        assert(civ.hp == 100, 'hp should be 100 after defend');
        assert(civ.is_alive, 'civ should still be alive');
    }
}
