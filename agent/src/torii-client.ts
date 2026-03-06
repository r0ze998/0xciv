// Torii GraphQL client for reading on-chain game state

import { Civilization, Territory, GameState, TradeProposal } from './types'

const TORII_URL = process.env.TORII_URL || 'http://localhost:8080/graphql'

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

export async function getGameState(gameId: number): Promise<GameState> {
  const data = await query(`{
    gameStateModels(where: { game_id: ${gameId} }) {
      edges { node {
        game_id turn_number game_phase civ_count alive_count next_trade_id
      }}
    }
  }`)
  const node = data.gameStateModels.edges[0]?.node
  if (!node) throw new Error('Game not found')
  return {
    game_id: node.game_id,
    turn_number: node.turn_number,
    game_phase: node.game_phase === 0 ? 'lobby' : node.game_phase === 1 ? 'active' : 'ended',
    civ_count: node.civ_count,
    alive_count: node.alive_count,
    next_trade_id: node.next_trade_id,
  }
}

export async function getCivilizations(gameId: number): Promise<Civilization[]> {
  const data = await query(`{
    civilizationModels(where: { game_id: ${gameId} }, limit: 10) {
      edges { node {
        civ_id owner hp food metal knowledge territory_count military_strength is_alive
      }}
    }
  }`)
  return data.civilizationModels.edges.map((e: any) => ({
    civ_id: e.node.civ_id,
    owner: e.node.owner,
    hp: e.node.hp,
    food: e.node.food,
    metal: e.node.metal,
    knowledge: e.node.knowledge,
    territory_count: e.node.territory_count,
    military_strength: e.node.military_strength,
    is_alive: !!e.node.is_alive,
  }))
}

export async function getTerritories(gameId: number): Promise<Territory[]> {
  const data = await query(`{
    territoryModels(where: { game_id: ${gameId} }, limit: 30) {
      edges { node {
        x y owner_civ_id resource_type
      }}
    }
  }`)
  const resourceMap = ['food', 'metal', 'knowledge'] as const
  return data.territoryModels.edges.map((e: any) => ({
    x: e.node.x,
    y: e.node.y,
    owner_civ_id: e.node.owner_civ_id,
    resource_type: resourceMap[e.node.resource_type] || 'food',
  }))
}

export async function getActiveTrades(gameId: number): Promise<TradeProposal[]> {
  const data = await query(`{
    tradeProposalModels(where: { game_id: ${gameId}, is_active: true }, limit: 20) {
      edges { node {
        trade_id from_civ to_civ offer_type offer_amount request_type request_amount is_active
      }}
    }
  }`)
  const resourceMap = ['food', 'metal', 'knowledge'] as const
  return data.tradeProposalModels.edges.map((e: any) => ({
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
