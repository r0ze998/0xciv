import type { Civilization } from '../types/game'
import { SkullIcon, FoodIcon, ShieldIcon } from './Icons'

interface Props {
  civ: Civilization
}

type Danger = { icon: React.ReactNode; label: string; severity: 'warn' | 'crit' }

export function DangerIndicator({ civ }: Props) {
  if (!civ.isAlive) return null

  const dangers: Danger[] = []

  if (civ.hp <= 15) dangers.push({ icon: <SkullIcon size={10} color="#f87171" />, label: `HP ${civ.hp}`, severity: 'crit' })
  else if (civ.hp <= 30) dangers.push({ icon: <SkullIcon size={10} color="#eab308" />, label: `HP ${civ.hp}`, severity: 'warn' })

  if (civ.food <= 10) dangers.push({ icon: <FoodIcon size={10} color="#f87171" />, label: `Food ${civ.food}`, severity: 'crit' })
  else if (civ.food <= 20) dangers.push({ icon: <FoodIcon size={10} color="#eab308" />, label: `Food ${civ.food}`, severity: 'warn' })

  if (civ.territories <= 1) dangers.push({ icon: <ShieldIcon size={10} color="#f87171" />, label: 'Last territory!', severity: 'crit' })

  if (dangers.length === 0) return null

  return (
    <div className="flex gap-1 flex-wrap">
      {dangers.map((d, i) => (
        <span
          key={i}
          className={`text-[9px] px-1 py-0.5 rounded flex items-center gap-0.5 ${
            d.severity === 'crit'
              ? 'bg-red-900/60 text-red-400 animate-pulse'
              : 'bg-yellow-900/40 text-yellow-500'
          }`}
        >
          {d.icon} {d.label}
        </span>
      ))}
    </div>
  )
}
