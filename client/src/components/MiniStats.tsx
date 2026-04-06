import type { Civilization } from '../types/game'
import { ShieldIcon, SwordIcon, CrownIcon } from './Icons'

interface Props {
  civs: Civilization[]
  turn: number
}

export function MiniStats({ civs, turn }: Props) {
  const alive = civs.filter(c => c.isAlive)
  const totalTerritories = civs.reduce((a, c) => a + c.territories, 0)
  const leader = [...alive].sort((a, b) => (b.territories + b.food + b.metal + b.knowledge) - (a.territories + a.food + a.metal + a.knowledge))[0]

  return (
    <div className="flex items-center gap-4 text-xs text-gray-500">
      <span className="flex items-center gap-1"><ShieldIcon size={12} color="#666" /> {totalTerritories} tiles</span>
      <span className="flex items-center gap-1"><SwordIcon size={12} color="#666" /> {alive.length}/{civs.length} alive</span>
      {leader && turn > 0 && (
        <span className="flex items-center gap-1">
          <CrownIcon size={12} color={leader.color} /> <span style={{ color: leader.color }}>{leader.name.split(' ')[0]}</span>
        </span>
      )}
    </div>
  )
}
