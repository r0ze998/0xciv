import type { Civilization } from '../types/game'
import { HPBar } from './HPBar'

export function ResourcePanel({ civ }: { civ: Civilization }) {
  return (
    <div className={`bg-gray-900/80 rounded-lg border p-4 space-y-3 ${!civ.isAlive ? 'opacity-40' : ''}`} style={{ borderColor: civ.isAlive ? civ.color : '#4b5563' }}>
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg" style={{ color: civ.isAlive ? civ.color : '#6b7280' }}>{civ.name}</h3>
        {!civ.isAlive && <span className="text-red-500 text-xs font-bold animate-pulse">☠️ ELIMINATED</span>}
      </div>
      <div>
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>HP</span><span>{civ.hp}/{civ.maxHp}</span>
        </div>
        <HPBar hp={civ.hp} maxHp={civ.maxHp} color={civ.color} />
      </div>
      <div className="space-y-1 text-sm">
        {([['🍞', 'food', civ.food, true], ['⚒️', 'metal', civ.metal, false], ['📚', 'knowledge', civ.knowledge, false]] as const).map(([icon, , val, fatal]) => (
          <div key={icon} className="flex items-center gap-2">
            <span className="w-5 text-center">{icon}</span>
            <div className="flex-1 bg-gray-800 rounded-full h-2">
              <div className="h-full rounded-full transition-all duration-500" style={{
                width: `${Math.min(100, (val as number) / 2)}%`,
                backgroundColor: fatal && (val as number) < 20 ? '#ef4444' : civ.color,
              }} />
            </div>
            <span className={`text-xs w-8 text-right ${fatal && (val as number) < 20 ? 'text-red-400 font-bold' : 'text-gray-400'}`}>{val as number}</span>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <span className="w-5 text-center">🏴</span>
          <span className="text-gray-300 text-xs">{civ.territories} territories</span>
        </div>
      </div>
    </div>
  )
}
