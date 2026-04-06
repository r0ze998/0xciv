import type { Civilization } from '../types/game'
import { TECH_ICONS } from './Icons'

interface Tech {
  name: string
  threshold: number
  effect: string
}

const TECHS: Tech[] = [
  { name: 'Agriculture', threshold: 15, effect: '+2 food/gather' },
  { name: 'Bronze Working', threshold: 25, effect: '+3 attack dmg' },
  { name: 'Writing', threshold: 40, effect: '+2 trade bonus' },
  { name: 'Philosophy', threshold: 60, effect: '+3 HP/defend' },
  { name: 'Engineering', threshold: 80, effect: 'Capture rate +15%' },
  { name: 'Enlightenment', threshold: 100, effect: 'All bonuses x1.5' },
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
        {TECHS.map((tech, i) => {
          const unlocked = civ.knowledge >= tech.threshold
          const iconData = TECH_ICONS[i]
          const IconComp = iconData.component
          return (
            <div
              key={tech.name}
              className="flex-1 flex items-center justify-center transition-all relative"
              style={{
                height: 18,
                backgroundColor: unlocked ? `${iconData.color}18` : 'var(--c-bg)',
                borderBottom: `2px solid ${unlocked ? iconData.color : 'var(--c-border)'}`,
                opacity: unlocked ? 1 : 0.3,
              }}
              title={`${tech.name} (${tech.threshold} KNOW): ${tech.effect}${unlocked ? ' [UNLOCKED]' : ''}`}
            >
              <IconComp size={12} color={unlocked ? iconData.color : '#333'} />
            </div>
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
