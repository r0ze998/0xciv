import type { Civilization } from '../types/game'

interface Props {
  civ: Civilization
  allCivs: Civilization[]
}

export function PromptHint({ civ, allCivs }: Props) {
  if (!civ.isAlive) return null

  const hints: string[] = []
  const enemies = allCivs.filter(c => c.isAlive && c.id !== civ.id)
  const weakest = [...enemies].sort((a, b) => a.hp - b.hp)[0]

  if (civ.food < 20) hints.push('🍞 Food is low — gather resources')
  if (civ.hp < 30) hints.push('❤️ HP critical — consider defending')
  if (civ.metal > 60 && weakest) hints.push(`⚔️ High metal — ${weakest.name} is weak (HP ${weakest.hp})`)
  if (civ.territories >= 8) hints.push('👑 Dominating the map — turtle up?')
  if (enemies.length === 1) hints.push('🎯 Final showdown — one enemy left!')

  if (hints.length === 0) return null

  return (
    <div className="flex gap-1 flex-wrap mb-2">
      {hints.slice(0, 2).map((h, i) => (
        <span key={i} className="text-[10px] text-gray-500 bg-gray-800/60 rounded px-1.5 py-0.5">
          {h}
        </span>
      ))}
    </div>
  )
}
