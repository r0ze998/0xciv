// Torii GraphQL client for reading on-chain game state

import { Civilization, Territory, GameState, TradeProposal } from './types'

const TORII_URL = process.env.TORII_URL || 'http://localhost:8080/graphql'

function parseNum(v: any): number {
  if (typeof v === 'number') return v
  if (typeof v === 'string' && v.startsWith('0x')) return parseInt(v, 16)
  return parseInt(v) || 0
}

async function query(q: string): Promise<any> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)
  try {
    const res = await fetch(TORII_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: q }),
      signal: controller.signal,
    })
    if (!res.ok) throw new Error(`Torii query failed: ${res.status}`)
    const data: any = await res.json()
    if (data.errors) throw new Error(`Torii errors: ${JSON.stringify(data.errors)}`)
    return data.data
  } finally {
    clearTimeout(timeout)
  }
}

export async function getGameState(gameId: number): Promise<GameState> {
  const data = await query(`{
    dojoStarterGameStateModels(where: { game_id: ${gameId} }) {
      edges { node {
        game_id turn_number game_phase civ_count alive_count next_trade_id
      }}
    }
  }`)
  const node = data.dojoStarterGameStateModels.edges[0]?.node
  if (!node) throw new Error('Game not found')
  const phaseMap: Record<string, string> = { 'Lobby': 'lobby', 'Running': 'active', 'Ended': 'ended' }
  return {
    game_id: node.game_id,
    turn_number: typeof node.turn_number === 'string' ? parseInt(node.turn_number, 16) : node.turn_number,
    game_phase: (phaseMap[node.game_phase] || (node.game_phase === 0 ? 'lobby' : node.game_phase === 1 ? 'active' : 'ended')) as 'lobby' | 'active' | 'ended',
    civ_count: typeof node.civ_count === 'string' ? parseInt(node.civ_count, 16) : node.civ_count,
    alive_count: typeof node.alive_count === 'string' ? parseInt(node.alive_count, 16) : node.alive_count,
    next_trade_id: node.next_trade_id,
  }
}

export async function getCivilizations(gameId: number): Promise<Civilization[]> {
  const data = await query(`{
    dojoStarterCivilizationModels(limit: 10) {
      edges { node {
        civ_id owner hp food metal knowledge territory_count military_strength is_alive
      }}
    }
  }`)
  return data.dojoStarterCivilizationModels.edges.map((e: any) => ({
    civ_id: parseNum(e.node.civ_id),
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

export async function getTerritories(gameId: number): Promise<Territory[]> {
  const data = await query(`{
    dojoStarterTerritoryModels(limit: 30) {
      edges { node {
        x y owner_civ_id resource_type
      }}
    }
  }`)
  const resourceMap = ['food', 'metal', 'knowledge'] as const
  return data.dojoStarterTerritoryModels.edges.map((e: any) => ({
    x: e.node.x,
    y: e.node.y,
    owner_civ_id: e.node.owner_civ_id,
    resource_type: resourceMap[e.node.resource_type] || 'food',
  }))
}

export async function getActiveTrades(gameId: number): Promise<TradeProposal[]> {
  const data = await query(`{
    dojoStarterTradeProposalModels(limit: 20) {
      edges { node {
        trade_id from_civ to_civ offer_type offer_amount request_type request_amount is_active
      }}
    }
  }`)
  const resourceMap = ['food', 'metal', 'knowledge'] as const
  return data.dojoStarterTradeProposalModels.edges.map((e: any) => ({
    trade_id: e.node.trade_id,
    from_civ: e.node.from_civ,
    to_civ: e.node.to_civ,
    offer_type: resourceMap[e.node.offer_type] || 'food',
    offer_amount: e.node.offer_amount,
    request_type: resourceMap[e.node.request_type] || 'food',
    request_amount: e.node.request_amount,
    is_active: !!e.node.is_active,
  }))
}
