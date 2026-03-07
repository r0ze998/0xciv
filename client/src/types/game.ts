export type ResourceType = 'food' | 'metal' | 'knowledge'
export type Phase = 'lobby' | 'playing' | 'ended'

export interface Territory {
  x: number
  y: number
  owner: number | null
  resource: ResourceType
}

export interface Civilization {
  id: number
  name: string
  color: string
  neonClass: string
  hp: number
  maxHp: number
  food: number
  metal: number
  knowledge: number
  territories: number
  isAlive: boolean
  prompt: string
}

export interface LogEntry {
  turn: number
  message: string
  type: 'action' | 'combat' | 'trade' | 'elimination' | 'system'
}

export interface GameStats {
  totalTurns: number
  combatEvents: number
  tradeEvents: number
  eliminationOrder: { name: string; color: string; turn: number }[]
  peakHP: { name: string; color: string; hp: number; turn: number }
  peakTerritories: { name: string; color: string; count: number; turn: number }
  totalGathered: Record<number, { food: number; metal: number; knowledge: number }>
}
