import type { Civilization } from '../types/game'
import { getTechLevel } from './TechTree'

interface Props {
  civ: Civilization
  isSelected: boolean
  onClick: () => void
}

const RANK_LABELS = ['', 'Stone Age', 'Bronze Age', 'Classical', 'Medieval', 'Industrial', 'Enlightened']

export function CivPortrait({ civ, isSelected, onClick }: Props) {
  const techLevel = getTechLevel(civ.knowledge)
  const hpPercent = civ.maxHp > 0 ? (civ.hp / civ.maxHp) * 100 : 0
  const isLow = civ.hp < 20 || civ.food < 10
  const isDead = !civ.isAlive

  return (
    <button
      onClick={onClick}
      className={`relative flex-1 border p-2 transition-all duration-300 hex-clip ${
        isSelected ? 'scale-105' : 'opacity-50 hover:opacity-80'
      } ${isDead ? 'opacity-15 grayscale' : ''} ${isLow && !isDead ? 'animate-danger-pulse' : ''}`}
      style={{
        borderColor: isSelected ? civ.color : `${civ.color}44`,
        boxShadow: isSelected ? `0 0 25px ${civ.color}33, inset 0 0 15px ${civ.color}11` : 'none',
        backgroundColor: isSelected ? `${civ.color}0a` : 'var(--c-surface)',
      }}
    >
      {/* HP bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 overflow-hidden" style={{ backgroundColor: 'var(--c-bg)' }}>
        <div
          className="h-full transition-all duration-500"
          style={{
            width: `${hpPercent}%`,
            backgroundColor: hpPercent > 50 ? civ.color : hpPercent > 25 ? 'var(--c-warning)' : 'var(--c-danger)',
            boxShadow: `0 0 4px ${hpPercent > 50 ? civ.color : hpPercent > 25 ? 'var(--c-warning)' : 'var(--c-danger)'}`,
          }}
        />
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-lg">{isDead ? '&#9760;' : techLevel >= 5 ? '&#9813;' : techLevel >= 3 ? '&#9876;' : '&#8962;'}</span>
        <div className="text-left min-w-0">
          <p className="text-[10px] font-bold truncate" style={{
            color: civ.color,
            fontFamily: 'var(--font-display)',
            letterSpacing: '0.05em',
            textShadow: isSelected ? `0 0 6px ${civ.color}44` : 'none',
          }}>
            {civ.name.split(' ')[0]}
          </p>
          <p className="text-[7px] tracking-wider" style={{ color: 'var(--c-text-muted)', fontFamily: 'var(--font-display)' }}>
            {isDead ? 'OFFLINE' : RANK_LABELS[techLevel] || 'Nomadic'}
          </p>
        </div>
      </div>
    </button>
  )
}
