import type { Civilization } from '../types/game'

interface Tech {
  name: string
  icon: string
  threshold: number
  effect: string
}

const TECHS: Tech[] = [
  { name: 'Agriculture', icon: '🌾', threshold: 15, effect: '+2 food/gather' },
  { name: 'Bronze Working', icon: '🔨', threshold: 25, effect: '+3 attack dmg' },
  { name: 'Writing', icon: '📜', threshold: 40, effect: '+2 trade bonus' },
  { name: 'Philosophy', icon: '🧠', threshold: 60, effect: '+3 HP/defend' },
  { name: 'Engineering', icon: '⚙️', threshold: 80, effect: 'Capture rate +15%' },
  { name: 'Enlightenment', icon: '💫', threshold: 100, effect: 'All bonuses ×1.5' },
]

export function getTechLevel(knowledge: number): number {
  return TECHS.filter(t => knowledge >= t.threshold).length
}

export function getUnlockedTechs(knowledge: number): Tech[] {
  return TECHS.filter(t => knowledge >= t.threshold)
}

interface Props {
  civ: Civilization
}

export function TechTree({ civ }: Props) {
  if (!civ.isAlive) return null
  const level = getTechLevel(civ.knowledge)

  return (
    <div className="mt-1.5">
      <div className="flex gap-0.5">
        {TECHS.map((tech) => {
          const unlocked = civ.knowledge >= tech.threshold
          return (
            <div
              key={tech.name}
              className={`flex-1 h-1 rounded-full transition-all ${unlocked ? '' : 'bg-gray-800'}`}
              style={{ backgroundColor: unlocked ? civ.color : undefined, opacity: unlocked ? 0.8 : 0.3 }}
              title={`${tech.icon} ${tech.name} (${tech.threshold} 📚): ${tech.effect}${unlocked ? ' ✅' : ''}`}
            />
          )
        })}
      </div>
      {level > 0 && (
        <p className="text-[8px] text-gray-600 mt-0.5">
          {TECHS.filter(t => civ.knowledge >= t.threshold).map(t => t.icon).join('')} Lv.{level}
        </p>
      )}
    </div>
  )
}
