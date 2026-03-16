import type { Civilization } from '../types/game'

interface Tech {
  name: string
  icon: string
  threshold: number
  effect: string
}

const TECHS: Tech[] = [
  { name: 'Agriculture', icon: '01', threshold: 15, effect: '+2 food/gather' },
  { name: 'Bronze Working', icon: '02', threshold: 25, effect: '+3 attack dmg' },
  { name: 'Writing', icon: '03', threshold: 40, effect: '+2 trade bonus' },
  { name: 'Philosophy', icon: '04', threshold: 60, effect: '+3 HP/defend' },
  { name: 'Engineering', icon: '05', threshold: 80, effect: 'Capture rate +15%' },
  { name: 'Enlightenment', icon: '06', threshold: 100, effect: 'All bonuses x1.5' },
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
              className="flex-1 h-1 transition-all"
              style={{
                backgroundColor: unlocked ? civ.color : 'var(--c-bg)',
                opacity: unlocked ? 0.9 : 0.3,
                boxShadow: unlocked ? `0 0 4px ${civ.color}55` : 'none',
              }}
              title={`[${tech.icon}] ${tech.name} (${tech.threshold} KNOW): ${tech.effect}${unlocked ? ' [UNLOCKED]' : ''}`}
            />
          )
        })}
      </div>
      {level > 0 && (
        <p className="text-[7px] mt-0.5 tracking-wider"
          style={{ color: 'var(--c-text-muted)', fontFamily: 'var(--font-display)' }}>
          TECH_LV.{level}
        </p>
      )}
    </div>
  )
}
