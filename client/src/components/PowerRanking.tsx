import type { Civilization } from '../types/game'

interface Props {
  civs: Civilization[]
}

function calcPower(civ: Civilization): number {
  if (!civ.isAlive) return 0
  return civ.hp + civ.food * 0.8 + civ.metal * 1.2 + civ.knowledge * 0.5 + civ.territories * 15
}

export function PowerRanking({ civs }: Props) {
  const ranked = [...civs]
    .map(c => ({ ...c, power: calcPower(c) }))
    .sort((a, b) => b.power - a.power)

  const maxPower = Math.max(...ranked.map(r => r.power), 1)

  return (
    <div className="bg-gray-900/80 rounded-lg border border-gray-700 p-3">
      <h3 className="text-gray-500 text-xs font-bold mb-2 tracking-wider">⚡ POWER RANKING</h3>
      <div className="space-y-1.5">
        {ranked.map((c, i) => (
          <div key={c.id} className={`flex items-center gap-2 ${!c.isAlive ? 'opacity-30' : ''}`}>
            <span className="text-[10px] text-gray-600 w-4">{c.isAlive ? `#${i + 1}` : '☠️'}</span>
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
            <span className="text-xs truncate flex-shrink-0 w-16" style={{ color: c.color }}>
              {c.name.split(' ')[0]}
            </span>
            <div className="flex-1 bg-gray-800 rounded-full h-2">
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${(c.power / maxPower) * 100}%`, backgroundColor: c.color }}
              />
            </div>
            <span className="text-[10px] text-gray-500 w-8 text-right">{Math.round(c.power)}</span>
          </div>
        ))}
      </div>
      <p className="text-[8px] text-gray-700 mt-1.5">Power = HP + Food×0.8 + Metal×1.2 + Knowledge×0.5 + Territory×15</p>
    </div>
  )
}
