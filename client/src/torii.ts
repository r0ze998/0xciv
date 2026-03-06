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
  resource_type: number // 0=food, 1=metal, 2=knowledge
}

export interface OnChainGameState {
  game_id: number
  turn_number: number
  game_phase: number // 0=Setup, 1=Running, 2=Ended
  civ_count: number
  alive_count: number
  next_trade_id: number
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

export async function fetchCivilizations(gameId: number): Promise<OnChainCivilization[]> {
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
    hp: Number(e.node.hp),
    food: Number(e.node.food),
    metal: Number(e.node.metal),
    knowledge: Number(e.node.knowledge),
    territory_count: e.node.territory_count,
    military_strength: Number(e.node.military_strength),
    is_alive: !!e.node.is_alive,
  }))
}

export async function fetchTerritories(): Promise<OnChainTerritory[]> {
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

export async function fetchAllOnChainData(gameId: number = 1) {
  const [gameState, civs, territories] = await Promise.all([
    fetchGameState(gameId),
    fetchCivilizations(gameId),
    fetchTerritories(),
  ])
  return { gameState, civs, territories }
}
