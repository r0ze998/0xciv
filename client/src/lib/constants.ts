import type { ResourceType } from '../types/game'

export const GRID_SIZE = 5

export const COLORS = [
  { color: '#00ffff', neonClass: 'text-cyan-400 border-cyan-400', bg: 'bg-cyan-900/60', name: 'Cyan Empire' },
  { color: '#ff00ff', neonClass: 'text-fuchsia-400 border-fuchsia-400', bg: 'bg-fuchsia-900/60', name: 'Magenta Dominion' },
  { color: '#facc15', neonClass: 'text-yellow-400 border-yellow-400', bg: 'bg-yellow-900/60', name: 'Gold Republic' },
  { color: '#4ade80', neonClass: 'text-green-400 border-green-400', bg: 'bg-green-900/60', name: 'Jade Federation' },
] as const

export const RESOURCE_ICONS: Record<ResourceType, string> = { food: '🍞', metal: '⚒️', knowledge: '📚' }
export const RESOURCE_MAP: ResourceType[] = ['food', 'metal', 'knowledge']

export const PRESET_STRATEGIES = [
  ['🗡️ Aggro', 'Attack the weakest enemy every turn. Expand territory aggressively. Gather only when metal is low.'],
  ['🛡️ Turtle', 'Defend every turn. Gather resources. Never attack first. Trade for food if below 50.'],
  ['📈 Econ', 'Maximize resource gathering. Trade surplus metal for food. Only attack if victory is certain.'],
  ['🎲 Chaos', 'Alternate between attacking random enemies and gathering. Propose absurd trades to confuse opponents.'],
] as const
