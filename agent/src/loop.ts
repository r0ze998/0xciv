// Game loop: run multiple turns automatically
import { AgentAction, AgentContext } from './types'
import { getGameState, getCivilizations, getTerritories, getActiveTrades } from './torii-client'
import { executeAction } from './executor'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const GAME_ID = parseInt(process.env.GAME_ID || '1')
const CIV_ID = parseInt(process.env.CIV_ID || '1')
const TURN_DELAY_MS = parseInt(process.env.TURN_DELAY_MS || '5000')
const MAX_TURNS = parseInt(process.env.MAX_TURNS || '50')

async function callLLM(context: AgentContext): Promise<AgentAction> {
  if (!ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set')

  const systemPrompt = `You are an AI agent controlling civilization #${context.myCiv.civ_id} in 0xCIV.

PLAYER'S STRATEGY: "${context.playerPrompt}"

Based on game state, decide ONE action. Available: gather, attack (target_civ), defend, propose_trade, accept_trade.

ELIMINATION: HP=0, Food=0, or all territories lost = death.

Respond with ONLY JSON: {"action":"...","target_civ":N,"reasoning":"..."}`

  const stateText = `Turn ${context.gameState.turn_number} | YOUR CIV #${context.myCiv.civ_id}: HP=${context.myCiv.hp} Food=${context.myCiv.food} Metal=${context.myCiv.metal} Knowledge=${context.myCiv.knowledge} Territories=${context.myCiv.territory_count}
OTHERS: ${context.allCivs.filter(c => c.civ_id !== context.myCiv.civ_id && c.is_alive).map(c => `#${c.civ_id}:HP=${c.hp},Food=${c.food},Metal=${c.metal}`).join(' | ')}
TRADES: ${context.activeTrades.length === 0 ? 'None' : context.activeTrades.map(t => `#${t.trade_id}:${t.from_civ}→${t.to_civ}`).join(', ')}`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      system: systemPrompt,
      messages: [{ role: 'user', content: stateText }],
    }),
  })

  if (!res.ok) throw new Error(`API error: ${res.status}`)
  const data: any = await res.json()
  const text = data.content[0]?.text || '{}'
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error(`Parse failed: ${text}`)
  return JSON.parse(jsonMatch[0]) as AgentAction
}

async function runOneTurn(): Promise<boolean> {
  const [gameState, allCivs, territories, activeTrades] = await Promise.all([
    getGameState(GAME_ID),
    getCivilizations(GAME_ID),
    getTerritories(GAME_ID),
    getActiveTrades(GAME_ID),
  ])

  if (gameState.game_phase === 'ended') {
    console.log('🏁 Game ended!')
    return false
  }

  const myCiv = allCivs.find(c => c.civ_id === CIV_ID)
  if (!myCiv) { console.log('❌ Civ not found'); return false }
  if (!myCiv.is_alive) { console.log('☠️ Eliminated'); return false }

  const playerPrompt = process.env.PLAYER_PROMPT || 'Survive. Gather. Attack if threatened.'
  const context: AgentContext = { gameState, myCiv, allCivs, territories, activeTrades, playerPrompt }

  console.log(`\n--- Turn ${gameState.turn_number} | HP:${myCiv.hp} Food:${myCiv.food} Metal:${myCiv.metal} Knowledge:${myCiv.knowledge} ---`)

  const action = await callLLM(context)
  console.log(`⚡ ${action.action} ${action.target_civ ? `→ Civ#${action.target_civ}` : ''} | ${action.reasoning}`)

  try {
    const tx = await executeAction(CIV_ID, action)
    console.log(`✅ TX: ${tx.substring(0, 18)}...`)
  } catch (err: any) {
    console.error(`❌ TX failed: ${err.message}`)
  }

  return true
}

let running = true
process.on('SIGINT', () => { console.log('\n⏹ Graceful shutdown...'); running = false })
process.on('SIGTERM', () => { console.log('\n⏹ Terminated'); running = false })

async function main() {
  console.log(`🤖 0xCIV Agent Loop — Game ${GAME_ID}, Civ ${CIV_ID}`)
  console.log(`Strategy: "${process.env.PLAYER_PROMPT || 'default'}"`)
  console.log(`Max turns: ${MAX_TURNS}, delay: ${TURN_DELAY_MS}ms\n`)

  for (let i = 0; i < MAX_TURNS && running; i++) {
    const keepGoing = await runOneTurn()
    if (!keepGoing) break
    if (running) await new Promise(r => setTimeout(r, TURN_DELAY_MS))
  }

  console.log('\n🏁 Agent loop finished.')
}

main().catch(err => { console.error('Fatal:', err); process.exit(1) })
