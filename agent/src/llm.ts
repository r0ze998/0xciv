// Shared LLM caller for 0xCIV agent
import { AgentAction, AgentContext } from './types'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

function buildSystemPrompt(context: AgentContext, verbose: boolean): string {
  const base = `You are an AI agent controlling civilization #${context.myCiv.civ_id} in 0xCIV.

PLAYER'S STRATEGY: "${context.playerPrompt}"

Based on game state, decide ONE action. Available: gather, attack (target_civ), defend, propose_trade, accept_trade.

ELIMINATION: HP=0, Food=0, or all territories lost = death.`

  if (!verbose) return base + '\n\nRespond with ONLY JSON: {"action":"...","target_civ":N,"reasoning":"..."}'

  return base + `

Available actions:
- gather: Collect resources from your territories. Safe, builds economy.
- attack: Attack another civilization. Costs metal, damages their HP, may capture territory.
  - Requires: target_civ (civ_id of target)
- defend: Fortify your defenses. Restores some HP.
- propose_trade: Offer a trade to another civ.
  - Requires: target_civ, offer_type, offer_amount, request_type, request_amount
- accept_trade: Accept a pending trade proposal.
  - Requires: trade_id

TACTICAL NOTES:
- Gathering increases food, metal, or knowledge (depends on your territories)
- Attacking costs metal but can capture territory and damage enemy HP
- Defending restores HP — use when low
- If food < 20, prioritize gathering to avoid starvation
- Trading can fill resource gaps without combat risk

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

  if (!verbose) {
    return `Turn ${gameState.turn_number} | YOUR CIV #${myCiv.civ_id}: HP=${myCiv.hp} Food=${myCiv.food} Metal=${myCiv.metal} Knowledge=${myCiv.knowledge} Territories=${myCiv.territory_count}
OTHERS: ${allCivs.filter(c => c.civ_id !== myCiv.civ_id && c.is_alive).map(c => `#${c.civ_id}:HP=${c.hp},Food=${c.food},Metal=${c.metal}`).join(' | ')}
TRADES: ${activeTrades.length === 0 ? 'None' : activeTrades.map(t => `#${t.trade_id}:${t.from_civ}→${t.to_civ}`).join(', ')}`
  }

  return `
GAME STATE (Turn ${gameState.turn_number}):
Alive civilizations: ${gameState.alive_count}/${gameState.civ_count}

YOUR CIV (#${myCiv.civ_id}):
  HP: ${myCiv.hp}/100
  Food: ${myCiv.food} ${myCiv.food < 20 ? '⚠️ LOW!' : ''}
  Metal: ${myCiv.metal}
  Knowledge: ${myCiv.knowledge}
  Territories: ${myCiv.territory_count}
  Military: ${myCiv.military_strength}

OTHER CIVS:
${allCivs.filter(c => c.civ_id !== myCiv.civ_id && c.is_alive).map(c =>
  `  Civ #${c.civ_id}: HP=${c.hp} Food=${c.food} Metal=${c.metal} Knowledge=${c.knowledge} Territories=${c.territory_count}`
).join('\n')}

ACTIVE TRADES:
${activeTrades.length === 0 ? '  None' : activeTrades.map(t =>
  `  Trade #${t.trade_id}: Civ #${t.from_civ} offers ${t.offer_amount} ${t.offer_type} for ${t.request_amount} ${t.request_type}`
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
  return JSON.parse(jsonMatch[0]) as AgentAction
}
