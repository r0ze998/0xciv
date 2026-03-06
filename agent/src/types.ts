// Game model types matching Cairo contracts

export type ResourceType = 'food' | 'metal' | 'knowledge'

export interface Civilization {
  civ_id: number
  owner: string // starknet address
  hp: number
  food: number
  metal: number
  knowledge: number
  territory_count: number
  military_strength: number
  is_alive: boolean
}

export interface Territory {
  x: number
  y: number
  owner_civ_id: number | null
  resource_type: ResourceType
}

export interface GameState {
  game_id: number
  turn_number: number
  game_phase: 'lobby' | 'active' | 'ended'
  civ_count: number
  alive_count: number
  next_trade_id: number
}

export interface TradeProposal {
  trade_id: number
  from_civ: number
  to_civ: number
  offer_type: ResourceType
  offer_amount: number
  request_type: ResourceType
  request_amount: number
  is_active: boolean
}

export type ActionType = 'gather' | 'attack' | 'defend' | 'propose_trade' | 'accept_trade'

export interface AgentAction {
  action: ActionType
  target_civ?: number
  target_x?: number
  target_y?: number
  offer_type?: ResourceType
  offer_amount?: number
  request_type?: ResourceType
  request_amount?: number
  trade_id?: number
  reasoning: string
}

export interface AgentContext {
  gameState: GameState
  myCiv: Civilization
  allCivs: Civilization[]
  territories: Territory[]
  activeTrades: TradeProposal[]
  playerPrompt: string
}
