import type { Civilization } from '../types/game'

export type VictoryType = 'domination' | 'research' | 'economic' | null

export interface VictoryCheck {
  type: VictoryType
  winner: Civilization | null
  message: string
}

const RESEARCH_THRESHOLD = 150  // knowledge needed for research victory
const ECONOMIC_THRESHOLD = 200  // food + metal + knowledge total

export function checkVictory(civs: Civilization[], turn: number): VictoryCheck {
  const alive = civs.filter(c => c.isAlive)

  // Domination: last civ standing
  if (alive.length <= 1 && civs.length > 1) {
    const winner = alive[0] || civs[0]
    return {
      type: 'domination',
      winner,
      message: `🗡️ DOMINATION VICTORY — ${winner.name} is the last civilization standing!`,
    }
  }

  // Research victory: first to reach knowledge threshold
  for (const c of alive) {
    if (c.knowledge >= RESEARCH_THRESHOLD) {
      return {
        type: 'research',
        winner: c,
        message: `🔬 RESEARCH VICTORY — ${c.name} achieved Enlightenment with ${c.knowledge} knowledge!`,
      }
    }
  }

  // Economic victory: first to reach total resource threshold (after turn 20)
  if (turn >= 20) {
    for (const c of alive) {
      const total = c.food + c.metal + c.knowledge
      if (total >= ECONOMIC_THRESHOLD) {
        return {
          type: 'economic',
          winner: c,
          message: `💰 ECONOMIC VICTORY — ${c.name} achieved prosperity with ${total} total resources!`,
        }
      }
    }
  }

  return { type: null, winner: null, message: '' }
}

export const VICTORY_COLORS: Record<string, string> = {
  domination: '#ef4444',
  research: '#a855f7',
  economic: '#eab308',
}

export const VICTORY_ICONS: Record<string, string> = {
  domination: '🗡️',
  research: '🔬',
  economic: '💰',
}
