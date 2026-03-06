// Torii GraphQL client for reading on-chain game state

const TORII_URL = import.meta.env.VITE_TORII_URL || 'http://localhost:8080/graphql'

export type ResourceType = 'food' | 'metal' | 'knowledge'

export interface OnChainCivilization {
  civ_id: number
  owner: string
  hp: number
  food: number
  metal: number
  knowledge: number
  territory_count: number
  military_strength: number
  is_alive: boolean
}

export interface OnChainTerritory {
  x: number
  y: number
  owner_civ_id: number
  resource_type: string // "Food" | "Metal" | "Knowledge" or number
}

export interface OnChainGameState {
  game_id: number
  turn_number: number
  game_phase: string // "Setup" | "Running" | "Ended"
  civ_count: number
  alive_count: number
  next_trade_id: number
}

// Parse hex string or number from Torii
function parseNum(v: any): number {
  if (typeof v === 'number') return v
  if (typeof v === 'string' && v.startsWith('0x')) return parseInt(v, 16)
  return Number(v) || 0
}

async function query(q: string): Promise<any> {
  const res = await fetch(TORII_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: q }),
  })
  if (!res.ok) throw new Error(`Torii query failed: ${res.status}`)
  const data: any = await res.json()
  if (data.errors) throw new Error(`Torii errors: ${JSON.stringify(data.errors)}`)
  return data.data
}

export async function fetchGameState(gameId: number): Promise<OnChainGameState | null> {
  const data = await query(`{
    dojoStarterGameStateModels(where: { game_id: ${gameId} }) {
      edges { node {
        game_id turn_number game_phase civ_count alive_count next_trade_id
      }}
    }
  }`)
  const node = data.dojoStarterGameStateModels?.edges[0]?.node
  if (!node) return null
  return {
    game_id: node.game_id,
    turn_number: node.turn_number,
    game_phase: node.game_phase,
    civ_count: node.civ_count,
    alive_count: node.alive_count,
    next_trade_id: node.next_trade_id,
  }
}

export async function fetchCivilizations(_gameId?: number): Promise<OnChainCivilization[]> {
  // Civs don't have game_id key, they use civ_id. Fetch all civs up to 4.
  const data = await query(`{
    dojoStarterCivilizationModels(limit: 10) {
      edges { node {
        civ_id owner hp food metal knowledge territory_count military_strength is_alive
      }}
    }
  }`)
  return (data.dojoStarterCivilizationModels?.edges || []).map((e: any) => ({
    civ_id: e.node.civ_id,
    owner: e.node.owner,
    hp: parseNum(e.node.hp),
    food: parseNum(e.node.food),
    metal: parseNum(e.node.metal),
    knowledge: parseNum(e.node.knowledge),
    territory_count: parseNum(e.node.territory_count),
    military_strength: parseNum(e.node.military_strength),
    is_alive: !!e.node.is_alive,
  }))
}

export async function fetchTerritories(_gameId?: number): Promise<OnChainTerritory[]> {
  const data = await query(`{
    dojoStarterTerritoryModels(limit: 30) {
      edges { node {
        x y owner_civ_id resource_type
      }}
    }
  }`)
  return (data.dojoStarterTerritoryModels?.edges || []).map((e: any) => ({
    x: e.node.x,
    y: e.node.y,
    owner_civ_id: e.node.owner_civ_id,
    resource_type: e.node.resource_type,
  }))
}

export interface OnChainEvent {
  type: 'action' | 'combat' | 'elimination' | 'trade'
  civ_id?: number
  turn?: number
  action?: string
  attacker_civ?: number
  defender_civ?: number
  attacker_won?: boolean
  hp_damage?: number
}

export async function fetchEvents(): Promise<OnChainEvent[]> {
  const data = await query(`{
    dojoStarterActionPerformedModels(limit: 20) {
      edges { node { civ_id turn action } }
    }
    dojoStarterCombatResultModels(limit: 20) {
      edges { node { attacker_civ defender_civ attacker_won hp_damage } }
    }
    dojoStarterCivEliminatedModels(limit: 10) {
      edges { node { civ_id } }
    }
  }`)

  const events: OnChainEvent[] = []

  for (const e of data.dojoStarterActionPerformedModels?.edges || []) {
    events.push({ type: 'action', civ_id: e.node.civ_id, turn: e.node.turn, action: e.node.action })
  }
  for (const e of data.dojoStarterCombatResultModels?.edges || []) {
    events.push({
      type: 'combat',
      attacker_civ: e.node.attacker_civ,
      defender_civ: e.node.defender_civ,
      attacker_won: !!e.node.attacker_won,
      hp_damage: parseNum(e.node.hp_damage),
    })
  }
  for (const e of data.dojoStarterCivEliminatedModels?.edges || []) {
    events.push({ type: 'elimination', civ_id: e.node.civ_id })
  }

  return events
}

export async function fetchAllOnChainData(gameId: number = 1) {
  const [gameState, civs, territories, events] = await Promise.all([
    fetchGameState(gameId),
    fetchCivilizations(gameId),
    fetchTerritories(),
    fetchEvents(),
  ])
  return { gameState, civs, territories, events }
}
