import type { Civilization } from '../types/game'

interface Props {
  civ: Civilization
}

export function DangerIndicator({ civ }: Props) {
  if (!civ.isAlive) return null

  const dangers: { icon: string; label: string; severity: 'warn' | 'crit' }[] = []

  if (civ.hp <= 15) dangers.push({ icon: '💀', label: `HP ${civ.hp}`, severity: 'crit' })
  else if (civ.hp <= 30) dangers.push({ icon: '❤️', label: `HP ${civ.hp}`, severity: 'warn' })

  if (civ.food <= 10) dangers.push({ icon: '🍞', label: `Food ${civ.food}`, severity: 'crit' })
  else if (civ.food <= 20) dangers.push({ icon: '🍞', label: `Food ${civ.food}`, severity: 'warn' })

  if (civ.territories <= 1) dangers.push({ icon: '🏴', label: 'Last territory!', severity: 'crit' })

  if (dangers.length === 0) return null

  return (
    <div className="flex gap-1 flex-wrap">
      {dangers.map((d, i) => (
        <span
          key={i}
          className={`text-[9px] px-1 py-0.5 rounded ${
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
