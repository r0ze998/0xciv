// 0xCIV Agent — Multi-turn game loop
import { AgentContext } from './types'
import { getGameState, getCivilizations, getTerritories, getActiveTrades } from './torii-client'
import { executeAction } from './executor'
import { callLLM } from './llm'

const GAME_ID = parseInt(process.env.GAME_ID || '1')
const CIV_ID = parseInt(process.env.CIV_ID || '1')
const TURN_DELAY_MS = parseInt(process.env.TURN_DELAY_MS || '5000')
const MAX_TURNS = parseInt(process.env.MAX_TURNS || '50')

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

  const action = await callLLM(context) // compact for loop mode
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
