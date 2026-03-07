// 0xCIV AI Agent — Single turn execution
import { AgentContext } from './types'
import { getGameState, getCivilizations, getTerritories, getActiveTrades } from './torii-client'
import { executeAction } from './executor'
import { callLLM } from './llm'

const GAME_ID = parseInt(process.env.GAME_ID || '1')
const CIV_ID = parseInt(process.env.CIV_ID || '0')

async function main() {
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

  const playerPrompt = process.env.PLAYER_PROMPT || 'Survive. Gather resources. Attack if threatened.'
  const context: AgentContext = { gameState, myCiv, allCivs, territories, activeTrades, playerPrompt }

  console.log(`Turn ${gameState.turn_number} | HP: ${myCiv.hp} | Food: ${myCiv.food} | Metal: ${myCiv.metal} | Knowledge: ${myCiv.knowledge}`)
  console.log(`Strategy: "${playerPrompt}"`)
  console.log('Thinking...')

  const action = await callLLM(context, true) // verbose for single-turn

  console.log(`\n⚡ Decision: ${action.action}`)
  console.log(`💭 Reasoning: ${action.reasoning}`)
  if (action.target_civ !== undefined) console.log(`🎯 Target: Civ #${action.target_civ}`)

  console.log('\n📤 Executing on-chain...')
  const txHash = await executeAction(CIV_ID, action)
  console.log(`✅ Transaction submitted: ${txHash}`)
}

main().catch(err => { console.error('❌ Agent error:', err); process.exit(1) })
