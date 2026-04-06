import { useState, useEffect, useRef } from 'react'
import type { Civilization } from '../types/game'
import { HPBar } from './HPBar'
import { DangerIndicator } from './DangerIndicator'
import { TechTree } from './TechTree'
import { FoodIcon, MetalIcon, KnowledgeIcon, ShieldIcon } from './Icons'

function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>(undefined)
  useEffect(() => { ref.current = value })
  return ref.current
}

function Delta({ current, prev }: { current: number; prev?: number }) {
  if (prev === undefined || current === prev) return null
  const diff = current - prev
  const color = diff > 0 ? 'neon-green' : 'neon-red'
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
    <div className={`rounded border p-2.5 sm:p-3 space-y-2 sm:space-y-3 transition-all ${!civ.isAlive ? 'opacity-30' : ''} ${flash ? 'animate-combat-shake' : ''}`}
      style={{
        backgroundColor: 'var(--c-surface)',
        borderColor: civ.isAlive ? `${civ.color}44` : 'var(--c-border)',
        boxShadow: civ.isAlive ? `inset 0 0 20px ${civ.color}08` : 'none',
      }}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-xs sm:text-sm truncate" style={{
          color: civ.isAlive ? civ.color : 'var(--c-text-muted)',
          fontFamily: 'var(--font-display)',
          letterSpacing: '0.05em',
          textShadow: civ.isAlive ? `0 0 8px ${civ.color}33` : 'none',
        }}>{civ.name}</h3>
        {!civ.isAlive && <span className="neon-red text-[9px] font-bold animate-glow-pulse tracking-wider"
          style={{ fontFamily: 'var(--font-display)' }}>ELIMINATED</span>}
      </div>
      <DangerIndicator civ={civ} />
      <div>
        <div className="flex justify-between text-[10px] mb-1" style={{ color: 'var(--c-text-dim)' }}>
          <span>HP</span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>
            {civ.hp}/{civ.maxHp}
            <Delta current={civ.hp} prev={prev?.hp} />
          </span>
        </div>
        <HPBar hp={civ.hp} maxHp={civ.maxHp} color={civ.color} />
      </div>
      <div className="space-y-1 text-sm">
        {([['FOOD', 'food', civ.food, prev?.food, true, FoodIcon], ['METAL', 'metal', civ.metal, prev?.metal, false, MetalIcon], ['KNOW', 'knowledge', civ.knowledge, prev?.knowledge, false, KnowledgeIcon]] as const).map(([icon, , val, prevVal, fatal, IconComp]) => (
          <div key={icon} className="flex items-center gap-2">
            <span className="w-8 flex items-center gap-0.5">
              <IconComp size={12} color={fatal && (val as number) < 20 ? '#ff0040' : civ.color} />
            </span>
            <div className="flex-1 rounded-full h-1.5" style={{ backgroundColor: 'var(--c-bg)' }}>
              <div className={`h-full rounded-full transition-all duration-500 ${fatal && (val as number) < 20 ? 'animate-danger-pulse' : ''}`} style={{
                width: `${Math.min(100, (val as number) / 2)}%`,
                backgroundColor: fatal && (val as number) < 20 ? 'var(--c-danger)' : civ.color,
                boxShadow: `0 0 4px ${fatal && (val as number) < 20 ? 'var(--c-danger)' : civ.color}44`,
              }} />
            </div>
            <span className={`text-[10px] w-12 text-right ${fatal && (val as number) < 20 ? 'neon-red font-bold' : ''}`}
              style={{ color: fatal && (val as number) < 20 ? undefined : 'var(--c-text-dim)', fontFamily: 'var(--font-mono)' }}>
              {val as number}
              <Delta current={val as number} prev={prevVal as number | undefined} />
            </span>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <span className="w-8 flex items-center">
            <ShieldIcon size={12} color={civ.color} />
          </span>
          <span className="text-xs" style={{ color: 'var(--c-text-dim)', fontFamily: 'var(--font-mono)' }}>
            {civ.territories}
            <Delta current={civ.territories} prev={prev?.territories} />
          </span>
        </div>
      </div>
      <TechTree civ={civ} />
    </div>
  )
}
