// Shared LLM caller for 0xCIV agent
import { AgentAction, AgentContext } from './types'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

function buildSystemPrompt(context: AgentContext, verbose: boolean): string {
  const { myCiv } = context
  const urgency: string[] = []
  if (myCiv.hp < 30) urgency.push('⚠️ CRITICAL: HP is dangerously low. Consider defending.')
  if (myCiv.food < 15) urgency.push('⚠️ CRITICAL: Food is dangerously low. Starvation imminent — gather NOW.')
  if (myCiv.territory_count <= 1) urgency.push('⚠️ CRITICAL: Down to last territory. Losing it means elimination.')

  const base = `You are an AI agent controlling civilization #${myCiv.civ_id} in 0xCIV, a strategy game on Starknet.

PLAYER'S STRATEGY PROMPT:
"${context.playerPrompt}"

Follow the player's strategy as closely as possible while keeping survival in mind.
${urgency.length > 0 ? '\n' + urgency.join('\n') : ''}

ELIMINATION CONDITIONS (any one = death):
- HP reaches 0
- Food reaches 0 (starvation)
- All territories lost

Each turn you lose 3 food passively. Plan accordingly.`

  if (!verbose) return base + '\n\nRespond with ONLY JSON: {"action":"...","target_civ":N,"reasoning":"..."}'

  return base + `

Available actions:
- gather: Collect resources from your territories. Safe, builds economy. Yields 5-20 of a random resource.
- attack: Attack another civilization. Costs ~5 metal, deals 5-25 damage, 40% chance to capture a territory.
  - Requires: target_civ (civ_id of target)
- defend: Fortify your defenses. Restores 5 HP. Good when HP is low.
- propose_trade: Offer a trade to another civ.
  - Requires: target_civ, offer_type (food|metal|knowledge), offer_amount, request_type, request_amount
- accept_trade: Accept a pending trade proposal.
  - Requires: trade_id

STRATEGIC CONSIDERATIONS:
- Gathering is the safest action and prevents starvation
- Attacking costs metal but can snowball with territory captures
- A civ with many territories generates more resources when gathering
- Trading can shore up weaknesses without risk
- Defending is essential when HP is low — you can't attack if you're dead
- The weakest civ is often the best attack target
- If you're winning, be cautious — other civs may gang up on you

Respond with ONLY a JSON object:
{
  "action": "gather|attack|defend|propose_trade|accept_trade",
  "target_civ": <number if needed>,
  "offer_type": "<resource if trading>",
  "offer_amount": <number if trading>,
  "request_type": "<resource if trading>",
  "request_amount": <number if trading>,
  "trade_id": <number if accepting trade>,
  "reasoning": "<brief explanation of your decision>"
}`
}

function buildStateText(context: AgentContext, verbose: boolean): string {
  const { gameState, myCiv, allCivs, activeTrades } = context
  const alive = allCivs.filter(c => c.is_alive)
  const enemies = alive.filter(c => c.civ_id !== myCiv.civ_id)
  const weakest = [...enemies].sort((a, b) => a.hp - b.hp)[0]
  const strongest = [...enemies].sort((a, b) => b.hp - a.hp)[0]

  if (!verbose) {
    return `Turn ${gameState.turn_number} | YOUR CIV #${myCiv.civ_id}: HP=${myCiv.hp} Food=${myCiv.food} Metal=${myCiv.metal} Knowledge=${myCiv.knowledge} Territories=${myCiv.territory_count}
OTHERS: ${enemies.map(c => `#${c.civ_id}:HP=${c.hp},Food=${c.food},Metal=${c.metal},Terr=${c.territory_count}`).join(' | ')}
${weakest ? `WEAKEST: #${weakest.civ_id}(HP=${weakest.hp})` : ''} ${strongest ? `STRONGEST: #${strongest.civ_id}(HP=${strongest.hp})` : ''}
TRADES: ${activeTrades.length === 0 ? 'None' : activeTrades.map(t => `#${t.trade_id}:from#${t.from_civ}→to#${t.to_civ} (${t.offer_amount} ${t.offer_type} for ${t.request_amount} ${t.request_type})`).join(', ')}`
  }

  return `
GAME STATE (Turn ${gameState.turn_number}):
Alive civilizations: ${gameState.alive_count}/${gameState.civ_count}

YOUR CIV (#${myCiv.civ_id}):
  HP: ${myCiv.hp}/100 ${myCiv.hp < 30 ? '⚠️ LOW' : myCiv.hp > 80 ? '💚 HEALTHY' : ''}
  Food: ${myCiv.food} ${myCiv.food < 15 ? '⚠️ STARVING SOON' : myCiv.food < 30 ? '⚠️ LOW' : ''}
  Metal: ${myCiv.metal} ${myCiv.metal < 10 ? '(too low to attack effectively)' : ''}
  Knowledge: ${myCiv.knowledge}
  Territories: ${myCiv.territory_count}
  Military: ${myCiv.military_strength}

OTHER CIVS:
${enemies.map(c =>
  `  Civ #${c.civ_id}: HP=${c.hp} Food=${c.food} Metal=${c.metal} Knowledge=${c.knowledge} Territories=${c.territory_count}${c.civ_id === weakest?.civ_id ? ' ← WEAKEST' : ''}${c.civ_id === strongest?.civ_id ? ' ← STRONGEST' : ''}`
).join('\n')}

ACTIVE TRADES:
${activeTrades.length === 0 ? '  None' : activeTrades.map(t =>
  `  Trade #${t.trade_id}: Civ #${t.from_civ} offers ${t.offer_amount} ${t.offer_type} for ${t.request_amount} ${t.request_type} → to Civ #${t.to_civ}`
).join('\n')}
`
}

export async function callLLM(context: AgentContext, verbose = false): Promise<AgentAction> {
  if (!ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set')

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: verbose ? 500 : 300,
      system: buildSystemPrompt(context, verbose),
      messages: [{ role: 'user', content: buildStateText(context, verbose) }],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Anthropic API error: ${res.status} ${err}`)
  }

  const data: any = await res.json()
  const text = data.content[0]?.text || '{}'
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error(`Failed to parse LLM response: ${text}`)

  const action = JSON.parse(jsonMatch[0]) as AgentAction

  // Safety overrides — survival takes priority
  if (context.myCiv.food < 10 && action.action !== 'gather') {
    console.log(`[OVERRIDE] Food critically low (${context.myCiv.food}), forcing gather instead of ${action.action}`)
    return { action: 'gather', reasoning: `Override: food at ${context.myCiv.food}, must gather to survive` }
  }
  if (context.myCiv.hp < 15 && action.action === 'attack') {
    console.log(`[OVERRIDE] HP critically low (${context.myCiv.hp}), forcing defend instead of attack`)
    return { action: 'defend', reasoning: `Override: HP at ${context.myCiv.hp}, must defend to survive` }
  }

  return action
}
