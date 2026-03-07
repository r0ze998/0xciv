import { useState } from 'react'

export interface Settings {
  foodDrain: number      // per-turn food cost
  startingHP: number
  startingFood: number
  eventFrequency: number // every N turns
}

const PRESETS: Record<string, Settings> = {
  casual: { foodDrain: 2, startingHP: 120, startingFood: 60, eventFrequency: 7 },
  standard: { foodDrain: 3, startingHP: 100, startingFood: 50, eventFrequency: 5 },
  hardcore: { foodDrain: 5, startingHP: 80, startingFood: 40, eventFrequency: 3 },
}

interface Props {
  onApply: (settings: Settings) => void
}

export function GameSettings({ onApply }: Props) {
  const [open, setOpen] = useState(false)
  const [preset, setPreset] = useState<string>('standard')

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-[10px] text-gray-600 hover:text-gray-400 transition-all"
      >
        ⚙️ Settings
      </button>
    )
  }

  return (
    <div className="bg-gray-900/80 rounded-lg border border-gray-700 p-3 animate-fade-up">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-gray-400 text-xs font-bold">⚙️ GAME SETTINGS</h3>
        <button onClick={() => setOpen(false)} className="text-gray-600 hover:text-white text-xs">✕</button>
      </div>
      <div className="flex gap-2 mb-2">
        {Object.entries(PRESETS).map(([name, settings]) => (
          <button
            key={name}
            onClick={() => { setPreset(name); onApply(settings) }}
            className={`px-2 py-1 rounded text-[10px] font-bold border transition-all ${
              preset === name
                ? 'border-cyan-500 text-cyan-400 bg-cyan-500/10'
                : 'border-gray-700 text-gray-500 hover:border-gray-500'
            }`}
          >
            {name === 'casual' ? '😊 Casual' : name === 'standard' ? '⚔️ Standard' : '💀 Hardcore'}
          </button>
        ))}
      </div>
      <div className="text-[10px] text-gray-600 space-y-0.5">
        <p>Food drain: {PRESETS[preset].foodDrain}/turn · HP: {PRESETS[preset].startingHP} · Food: {PRESETS[preset].startingFood}</p>
        <p>Events every {PRESETS[preset].eventFrequency} turns</p>
      </div>
    </div>
  )
}

export const DEFAULT_SETTINGS: Settings = PRESETS.standard
