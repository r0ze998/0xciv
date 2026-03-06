#[cfg(test)]
mod tests {
    use dojo::model::ModelStorage;
    use dojo::world::{WorldStorageTrait, world};
    use dojo_cairo_test::{
        ContractDef, ContractDefTrait, NamespaceDef, TestResource, WorldStorageTestTrait,
        spawn_test_world,
    };
    use dojo_starter::models::{
        GameState, m_Civilization, m_GameState, m_PlayerCiv, m_Strategy, m_Territory,
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
}
