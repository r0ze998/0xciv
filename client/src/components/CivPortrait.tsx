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
      className={`relative flex-1 rounded-lg border p-2 transition-all ${
        isSelected ? 'scale-105 ring-1' : 'opacity-60 hover:opacity-80'
      } ${isDead ? 'opacity-20 grayscale' : ''} ${isLow && !isDead ? 'animate-pulse' : ''}`}
      style={{
        borderColor: civ.color,
        boxShadow: isSelected ? `0 0 20px ${civ.color}33, inset 0 0 10px ${civ.color}11` : 'none',
      }}
    >
      {/* HP bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-lg overflow-hidden bg-gray-800">
        <div
          className="h-full transition-all duration-500"
          style={{
            width: `${hpPercent}%`,
            backgroundColor: hpPercent > 50 ? civ.color : hpPercent > 25 ? '#f59e0b' : '#ef4444',
          }}
        />
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-lg">{isDead ? '💀' : techLevel >= 5 ? '👑' : techLevel >= 3 ? '⚔️' : '🏠'}</span>
        <div className="text-left min-w-0">
          <p className="text-[11px] font-bold truncate" style={{ color: civ.color }}>
            {civ.name.split(' ')[0]}
          </p>
          <p className="text-[8px] text-gray-600">
            {isDead ? 'ELIMINATED' : RANK_LABELS[techLevel] || 'Nomadic'}
          </p>
        </div>
      </div>
    </button>
  )
}
