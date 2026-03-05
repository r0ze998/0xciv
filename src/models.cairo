use starknet::ContractAddress;

// === Enums ===

#[derive(Serde, Copy, Drop, Introspect, PartialEq, Debug, DojoStore, Default)]
pub enum ResourceType {
    #[default]
    Food,
    Metal,
    Knowledge,
}

#[derive(Serde, Copy, Drop, Introspect, PartialEq, Debug, DojoStore, Default)]
pub enum AgentAction {
    #[default]
    Gather,
    Trade,
    Attack,
    Defend,
}

#[derive(Serde, Copy, Drop, Introspect, PartialEq, Debug, DojoStore, Default)]
pub enum GamePhase {
    #[default]
    Setup,
    Running,
    Ended,
}

// === Models ===

#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct Civilization {
    #[key]
    pub civ_id: u32,
    pub owner: ContractAddress,
    pub hp: u128,
    pub food: u128,
    pub metal: u128,
    pub knowledge: u128,
    pub territory_count: u32,
    pub military_strength: u128,
    pub last_action: AgentAction,
    pub is_alive: bool,
}

#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct Strategy {
    #[key]
    pub civ_id: u32,
    pub prompt_hash: felt252,
}

#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct Territory {
    #[key]
    pub x: u32,
    #[key]
    pub y: u32,
    pub owner_civ_id: u32,
    pub resource_type: ResourceType,
}

#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct TradeProposal {
    #[key]
    pub trade_id: u32,
    pub from_civ: u32,
    pub to_civ: u32,
    pub offer_type: ResourceType,
    pub offer_amount: u128,
    pub request_type: ResourceType,
    pub request_amount: u128,
    pub is_active: bool,
}

#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct GameState {
    #[key]
    pub game_id: u32,
    pub turn_number: u32,
    pub game_phase: GamePhase,
    pub civ_count: u32,
    pub alive_count: u32,
    pub next_trade_id: u32,
}

// Lookup: maps owner address to civ_id
#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct PlayerCiv {
    #[key]
    pub owner: ContractAddress,
    pub civ_id: u32,
}

// === Into impls ===

impl ResourceTypeIntoFelt252 of Into<ResourceType, felt252> {
    fn into(self: ResourceType) -> felt252 {
        match self {
            ResourceType::Food => 0,
            ResourceType::Metal => 1,
            ResourceType::Knowledge => 2,
        }
    }
}

impl AgentActionIntoFelt252 of Into<AgentAction, felt252> {
    fn into(self: AgentAction) -> felt252 {
        match self {
            AgentAction::Gather => 0,
            AgentAction::Trade => 1,
            AgentAction::Attack => 2,
            AgentAction::Defend => 3,
        }
    }
}

impl GamePhaseIntoFelt252 of Into<GamePhase, felt252> {
    fn into(self: GamePhase) -> felt252 {
        match self {
            GamePhase::Setup => 0,
            GamePhase::Running => 1,
            GamePhase::Ended => 2,
        }
    }
}
