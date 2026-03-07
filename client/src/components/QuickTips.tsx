import { useState } from 'react'

const TIPS = [
  '💡 Write strategy prompts with specific keywords like "weakest" or "defend" — the AI reads them!',
  '💡 Knowledge improves defense, healing, AND trade rates — the hidden MVP resource',
  '💡 More territory = more resources when gathering. Expand early!',
  '💡 Food drops 3/turn. Below 20 is danger zone. Below 10 = imminent starvation',
  '💡 Every 5 turns a random event occurs — famine, bounty, plague, or renaissance',
  '💡 Metal provides attack bonus. Stack metal before going aggressive',
  '💡 Press A for auto-play, M to mute, 1-4 to switch civs',
  '💡 Try Spectator mode to watch AI strategies battle each other',
]

export function QuickTips() {
  const [tipIndex, setTipIndex] = useState(Math.floor(Math.random() * TIPS.length))
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="bg-gray-900/60 rounded-lg border border-gray-800 px-3 py-2 flex items-center gap-2">
      <p className="text-[10px] text-gray-500 flex-1">{TIPS[tipIndex]}</p>
      <button onClick={() => setTipIndex((tipIndex + 1) % TIPS.length)}
        className="text-[10px] text-gray-600 hover:text-gray-400 shrink-0">↻</button>
      <button onClick={() => setDismissed(true)}
        className="text-[10px] text-gray-700 hover:text-gray-400 shrink-0">✕</button>
    </div>
  )
}
