import { useState, useEffect, useRef } from 'react'
import type { Civilization } from '../types/game'
import { HPBar } from './HPBar'

function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>(undefined)
  useEffect(() => { ref.current = value })
  return ref.current
}

function Delta({ current, prev }: { current: number; prev?: number }) {
  if (prev === undefined || current === prev) return null
  const diff = current - prev
  const color = diff > 0 ? 'text-green-400' : 'text-red-400'
  return <span className={`text-[10px] ${color} ml-1 animate-log-entry`}>{diff > 0 ? '+' : ''}{diff}</span>
}

export function ResourcePanel({ civ }: { civ: Civilization }) {
  const prev = usePrevious(civ)
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    if (prev && prev.hp > civ.hp && civ.isAlive) {
      setFlash(true)
      const t = setTimeout(() => setFlash(false), 500)
      return () => clearTimeout(t)
    }
  }, [civ.hp, prev, civ.isAlive])

  return (
    <div className={`bg-gray-900/80 rounded-lg border p-4 space-y-3 transition-all ${!civ.isAlive ? 'opacity-40' : ''} ${flash ? 'animate-elimination' : ''}`}
      style={{ borderColor: civ.isAlive ? civ.color : '#4b5563' }}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg" style={{ color: civ.isAlive ? civ.color : '#6b7280' }}>{civ.name}</h3>
        {!civ.isAlive && <span className="text-red-500 text-xs font-bold animate-pulse">☠️ ELIMINATED</span>}
      </div>
      <div>
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>HP</span>
          <span>
            {civ.hp}/{civ.maxHp}
            <Delta current={civ.hp} prev={prev?.hp} />
          </span>
        </div>
        <HPBar hp={civ.hp} maxHp={civ.maxHp} color={civ.color} />
      </div>
      <div className="space-y-1 text-sm">
        {([['🍞', 'food', civ.food, prev?.food, true], ['⚒️', 'metal', civ.metal, prev?.metal, false], ['📚', 'knowledge', civ.knowledge, prev?.knowledge, false]] as const).map(([icon, , val, prevVal, fatal]) => (
          <div key={icon} className="flex items-center gap-2">
            <span className="w-5 text-center">{icon}</span>
            <div className="flex-1 bg-gray-800 rounded-full h-2">
              <div className={`h-full rounded-full transition-all duration-500 ${fatal && (val as number) < 20 ? 'resource-bar-critical' : ''}`} style={{
                width: `${Math.min(100, (val as number) / 2)}%`,
                backgroundColor: fatal && (val as number) < 20 ? undefined : civ.color,
              }} />
            </div>
            <span className={`text-xs w-12 text-right ${fatal && (val as number) < 20 ? 'text-red-400 font-bold' : 'text-gray-400'}`}>
              {val as number}
              <Delta current={val as number} prev={prevVal as number | undefined} />
            </span>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <span className="w-5 text-center">🏴</span>
          <span className="text-gray-300 text-xs">
            {civ.territories} territories
            <Delta current={civ.territories} prev={prev?.territories} />
          </span>
        </div>
      </div>
    </div>
  )
}
