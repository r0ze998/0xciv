import { useState } from 'react'
import { COLORS } from '../lib/constants'

interface Props {
  dataSource: 'loading' | 'torii' | 'mock'
  onStart: (names?: string[]) => void
  onSpectate: () => void
}

export function LobbyScreen({ dataSource, onStart, onSpectate }: Props) {
  const [names, setNames] = useState(COLORS.map(c => c.name))
  const [editing, setEditing] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white p-8 scanline">
      <div className="animate-fade-up">
        <h1 className="text-6xl sm:text-7xl font-black mb-2 tracking-wider title-glow text-center" style={{
          background: 'linear-gradient(135deg, #00ffff, #ff00ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>0xCIV</h1>
        <p className="text-gray-500 mb-8 text-lg tracking-wide text-center">Your Words Shape Civilizations</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8 animate-fade-up-delay-1">
        {COLORS.map((c, i) => (
          <div key={i}
            className="px-6 py-3 rounded-lg border text-center transition-all hover:scale-105 cursor-pointer"
            style={{ borderColor: c.color, color: c.color, boxShadow: `0 0 12px ${c.color}22` }}
            onClick={() => setEditing(i)}
            title="Click to rename"
          >
            {editing === i ? (
              <input
                autoFocus
                value={names[i]}
                onChange={e => { const n = [...names]; n[i] = e.target.value; setNames(n) }}
                onBlur={() => setEditing(null)}
                onKeyDown={e => e.key === 'Enter' && setEditing(null)}
                className="bg-transparent text-center w-full outline-none border-b"
                style={{ color: c.color, borderColor: c.color }}
                maxLength={20}
              />
            ) : (
              <span>{names[i]} <span className="text-[10px] opacity-40">✏️</span></span>
            )}
          </div>
        ))}
      </div>

      <div className="animate-fade-up-delay-2">
        <button
          onClick={() => onStart(names)}
          className="px-8 py-3 rounded-lg font-bold text-lg bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:from-cyan-400 hover:to-fuchsia-400 transition-all text-white shadow-lg shadow-fuchsia-500/25 hover:scale-105 active:scale-95"
        >
          START GAME
        </button>
      </div>

      <p className="text-gray-600 text-sm mt-4 flex items-center justify-center gap-2 animate-fade-up-delay-2">
        {dataSource === 'loading' && <span className="animate-spin">⏳</span>}
        {dataSource === 'torii' ? '🟢 Connected to Torii (on-chain)' :
         dataSource === 'mock' ? '🟡 Mock mode (Torii unavailable)' :
         'Connecting to Torii...'}
      </p>

      <div className="mt-6 max-w-md text-left bg-gray-900/60 rounded-lg border border-gray-800 p-4 animate-fade-up-delay-3">
        <h3 className="text-cyan-400 text-sm font-bold mb-2">🎮 How to Play</h3>
        <ol className="text-gray-400 text-xs space-y-1 list-decimal list-inside">
          <li>Write a <span className="text-cyan-300">strategy prompt</span> to command your AI civilization</li>
          <li>Your AI reads on-chain state and decides: gather, attack, defend, or trade</li>
          <li>Last civilization standing wins — <span className="text-red-400">HP=0, Food=0, or no territories = eliminated</span></li>
          <li>Opponent prompts are <span className="text-fuchsia-300">hidden</span> — information warfare!</li>
        </ol>
        <p className="text-gray-500 text-xs mt-2 italic">Theme: "Stop fighting bots — design around them"</p>
      </div>

      <div className="flex gap-3 mt-4 animate-fade-up-delay-3">
        <button
          onClick={onSpectate}
          className="px-4 py-2 rounded-lg text-sm font-bold border border-gray-700 text-gray-400 hover:border-cyan-500 hover:text-cyan-400 transition-all"
        >
          👁️ SPECTATE
        </button>
      </div>

      <p className="text-gray-700 text-xs mt-4 animate-fade-up-delay-3">Dojo Game Jam VIII</p>
    </div>
  )
}
