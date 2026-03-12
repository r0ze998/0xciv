import { useState } from 'react'
import type { Civilization } from '../types/game'

interface Props {
  civs: Civilization[]
  selectedCiv: number
  onSelectCiv: (i: number) => void
  turn: number
  dataSource: string
  walletAddress: string | null
  onWalletClick: () => void
  soundMuted: boolean
  onSoundToggle: () => void
  bgmPlaying: boolean
  onBGMToggle: () => void
  onLeaderboard: () => void
}

export function MobileNav({
  civs, selectedCiv, onSelectCiv, turn, dataSource,
  walletAddress, onWalletClick, soundMuted, onSoundToggle,
  bgmPlaying, onBGMToggle, onLeaderboard,
}: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="sm:hidden">
      {/* Bottom tab bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-950/95 border-t border-gray-800 z-30 flex justify-around py-1.5 px-2">
        {civs.map((c, i) => (
          <button key={i} onClick={() => onSelectCiv(i)}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded transition-all ${
              selectedCiv === i ? 'scale-110' : 'opacity-50'
            } ${!c.isAlive ? 'opacity-20' : ''}`}
          >
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
            <span className="text-[8px]" style={{ color: c.color }}>{c.hp}</span>
          </button>
        ))}
        <button onClick={() => setOpen(!open)}
          className="flex flex-col items-center gap-0.5 px-2 py-1 text-gray-400">
          <span className="text-sm">{open ? '✕' : '☰'}</span>
          <span className="text-[8px]">Menu</span>
        </button>
      </div>

      {/* Slide-up panel */}
      {open && (
        <div className="fixed inset-0 bg-black/80 z-40 transition-opacity" onClick={() => setOpen(false)}>
          <div className="absolute bottom-0 left-0 right-0 bg-gray-950 border-t border-gray-700 rounded-t-2xl p-4 max-h-[60vh] overflow-y-auto animate-slide-up"
            onClick={e => e.stopPropagation()}>
            <div className="w-8 h-1 bg-gray-700 rounded-full mx-auto mb-4" />

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gray-900 rounded-lg p-3 text-center">
                <p className="text-cyan-400 text-lg font-bold">T{turn}</p>
                <p className="text-gray-600 text-[10px]">Turn</p>
              </div>
              <div className="bg-gray-900 rounded-lg p-3 text-center">
                <p className={`text-lg font-bold ${dataSource === 'torii' ? 'text-green-400' : 'text-yellow-400'}`}>
                  {dataSource === 'torii' ? '🟢' : '🟡'}
                </p>
                <p className="text-gray-600 text-[10px]">{dataSource === 'torii' ? 'On-Chain' : 'Mock'}</p>
              </div>
            </div>

            <div className="space-y-2">
              <button onClick={onWalletClick}
                className="w-full py-2.5 rounded-lg text-sm font-bold border border-fuchsia-500 text-fuchsia-400">
                {walletAddress ? `${walletAddress.slice(0, 8)}...` : '🔗 Connect Wallet'}
              </button>
              <div className="flex gap-2">
                <button onClick={onSoundToggle}
                  className="flex-1 py-2.5 rounded-lg text-sm border border-gray-700 text-gray-400">
                  {soundMuted ? '🔇 SFX Off' : '🔊 SFX On'}
                </button>
                <button onClick={onBGMToggle}
                  className={`flex-1 py-2.5 rounded-lg text-sm border ${bgmPlaying ? 'border-fuchsia-500 text-fuchsia-400' : 'border-gray-700 text-gray-400'}`}>
                  {bgmPlaying ? '🎵 BGM On' : '🎶 BGM Off'}
                </button>
              </div>
              <button onClick={() => { onLeaderboard(); setOpen(false) }}
                className="w-full py-2.5 rounded-lg text-sm border border-yellow-600 text-yellow-500">
                🏆 Leaderboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
