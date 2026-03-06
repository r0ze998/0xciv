// 0xCIV Daydreams Agent — AI civilization decision-making
// Reads game state from Torii, uses LLM to decide actions based on player prompt

import { AgentAction, AgentContext } from './types'
import { getGameState, getCivilizations, getTerritories, getActiveTrades } from './torii-client'
import { executeAction } from './executor'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const GAME_ID = parseInt(process.env.GAME_ID || '1')
const CIV_ID = parseInt(process.env.CIV_ID || '0')

async function callLLM(context: AgentContext): Promise<AgentAction> {
  if (!ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set')

  const systemPrompt = `You are an AI agent controlling a civilization in 0xCIV, a strategy game.
Your civilization ID is ${context.myCiv.civ_id}.

PLAYER'S STRATEGY PROMPT (follow this as your primary directive):
"${context.playerPrompt}"

Based on the current game state and the player's strategy, decide ONE action to take this turn.

Available actions:
- gather: Collect resources from your territories. Safe, builds economy.
- attack: Attack another civilization. Costs metal, damages their HP, may capture territory.
  - Requires: target_civ (civ_id of target)
- defend: Fortify your defenses. Restores some HP.
- propose_trade: Offer a trade to another civ.
  - Requires: target_civ, offer_type, offer_amount, request_type, request_amount
- accept_trade: Accept a pending trade proposal.
  - Requires: trade_id

ELIMINATION CONDITIONS (avoid these!):
- HP reaches 0 → death
- Food reaches 0 → starvation death
- All territories lost → death

Respond with ONLY a JSON object:
{
  "action": "gather|attack|defend|propose_trade|accept_trade",
  "target_civ": <number if needed>,
  "target_x": <number if needed>,
  "target_y": <number if needed>,
  "offer_type": "<resource if trading>",
  "offer_amount": <number if trading>,
  "request_type": "<resource if trading>",
  "request_amount": <number if trading>,
  "trade_id": <number if accepting trade>,
  "reasoning": "<brief explanation of your decision>"
}`

  const gameStateText = `
GAME STATE (Turn ${context.gameState.turn_number}):
Alive civilizations: ${context.gameState.alive_count}/${context.gameState.civ_count}

YOUR CIV (#${context.myCiv.civ_id}):
  HP: ${context.myCiv.hp}/100
  Food: ${context.myCiv.food} ${context.myCiv.food < 20 ? '⚠️ LOW!' : ''}
  Metal: ${context.myCiv.metal}
  Knowledge: ${context.myCiv.knowledge}
  Territories: ${context.myCiv.territory_count}
  Military: ${context.myCiv.military_strength}

OTHER CIVS:
${context.allCivs.filter(c => c.civ_id !== context.myCiv.civ_id && c.is_alive).map(c =>
  `  Civ #${c.civ_id}: HP=${c.hp} Food=${c.food} Metal=${c.metal} Knowledge=${c.knowledge} Territories=${c.territory_count}`
).join('\n')}

ACTIVE TRADES:
${context.activeTrades.length === 0 ? '  None' : context.activeTrades.map(t =>
  `  Trade #${t.trade_id}: Civ #${t.from_civ} offers ${t.offer_amount} ${t.offer_type} for ${t.request_amount} ${t.request_type}`
).join('\n')}
`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      system: systemPrompt,
      messages: [{ role: 'user', content: gameStateText }],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Anthropic API error: ${res.status} ${err}`)
  }

  const data: any = await res.json()
  const text = data.content[0]?.text || '{}'

  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error(`Failed to parse LLM response: ${text}`)

  return JSON.parse(jsonMatch[0]) as AgentAction
}

async function runTurn(): Promise<AgentAction> {
  console.log(`\n🤖 0xCIV Agent — Game ${GAME_ID}, Civ ${CIV_ID}`)
  console.log('Reading game state from Torii...')

  const [gameState, allCivs, territories, activeTrades] = await Promise.all([
    getGameState(GAME_ID),
    getCivilizations(GAME_ID),
    getTerritories(GAME_ID),
    getActiveTrades(GAME_ID),
  ])

  const myCiv = allCivs.find(c => c.civ_id === CIV_ID)
  if (!myCiv) throw new Error(`Civ ${CIV_ID} not found`)
  if (!myCiv.is_alive) {
    console.log('☠️ Our civilization has been eliminated.')
    process.exit(0)
  }

  // Read player prompt from env or file
  const playerPrompt = process.env.PLAYER_PROMPT || 'Survive. Gather resources. Attack if threatened.'

  const context: AgentContext = {
    gameState,
    myCiv,
    allCivs,
    territories,
    activeTrades,
    playerPrompt,
  }

  console.log(`Turn ${gameState.turn_number} | HP: ${myCiv.hp} | Food: ${myCiv.food} | Metal: ${myCiv.metal} | Knowledge: ${myCiv.knowledge}`)
  console.log(`Strategy: "${playerPrompt}"`)
  console.log('Thinking...')

  const action = await callLLM(context)

  console.log(`\n⚡ Decision: ${action.action}`)
  console.log(`💭 Reasoning: ${action.reasoning}`)

  if (action.target_civ !== undefined) {
    console.log(`🎯 Target: Civ #${action.target_civ}`)
  }

  return action
}

// Main
async function main() {
  try {
    const action = await runTurn()
    console.log('\n📤 Action to execute on-chain:')
    console.log(JSON.stringify(action, null, 2))

    // Execute on-chain
    const txHash = await executeAction(CIV_ID, action)
    console.log(`\n✅ Transaction submitted: ${txHash}`)
  } catch (err) {
    console.error('❌ Agent error:', err)
    process.exit(1)
  }
}

main()
