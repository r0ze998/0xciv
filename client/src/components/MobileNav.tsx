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
      <div className="fixed bottom-0 left-0 right-0 border-t z-30 flex justify-around py-1.5 px-2"
        style={{ backgroundColor: 'rgba(10, 10, 15, 0.97)', borderColor: 'var(--c-border)' }}>
        {civs.map((c, i) => (
          <button key={i} onClick={() => onSelectCiv(i)}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 transition-all ${
              selectedCiv === i ? 'scale-110' : 'opacity-40'
            } ${!c.isAlive ? 'opacity-15' : ''}`}
          >
            <span className="w-3 h-3 rounded-sm" style={{
              backgroundColor: c.color,
              boxShadow: selectedCiv === i ? `0 0 6px ${c.color}` : 'none',
            }} />
            <span className="text-[8px]" style={{ color: c.color, fontFamily: 'var(--font-mono)' }}>{c.hp}</span>
          </button>
        ))}
        <button onClick={() => setOpen(!open)}
          className="flex flex-col items-center gap-0.5 px-2 py-1" style={{ color: 'var(--c-text-dim)' }}>
          <span className="text-sm">{open ? 'X' : '='}</span>
          <span className="text-[7px] tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>MENU</span>
        </button>
      </div>

      {/* Slide-up panel */}
      {open && (
        <div className="fixed inset-0 bg-black/80 z-40 transition-opacity" onClick={() => setOpen(false)}>
          <div className="absolute bottom-0 left-0 right-0 border-t rounded-t-lg p-4 max-h-[60vh] overflow-y-auto animate-slide-up"
            style={{ backgroundColor: 'var(--c-bg)', borderColor: 'var(--c-border)' }}
            onClick={e => e.stopPropagation()}>
            <div className="w-8 h-0.5 rounded-full mx-auto mb-4" style={{ backgroundColor: 'var(--c-border-bright)' }} />

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded border p-3 text-center" style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}>
                <p className="text-lg font-bold neon-cyan" style={{ fontFamily: 'var(--font-mono)' }}>T{turn}</p>
                <p className="text-[9px] tracking-wider" style={{ color: 'var(--c-text-muted)', fontFamily: 'var(--font-display)' }}>TURN</p>
              </div>
              <div className="rounded border p-3 text-center" style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}>
                <p className={`text-lg font-bold ${dataSource === 'torii' ? 'neon-green' : ''}`}
                  style={{ color: dataSource === 'torii' ? undefined : 'var(--c-warning)', fontFamily: 'var(--font-mono)' }}>
                  {dataSource === 'torii' ? 'ON' : 'MOCK'}
                </p>
                <p className="text-[9px] tracking-wider" style={{ color: 'var(--c-text-muted)', fontFamily: 'var(--font-display)' }}>
                  {dataSource === 'torii' ? 'ON-CHAIN' : 'LOCAL'}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <button onClick={onWalletClick}
                className="w-full py-2.5 text-xs font-bold border transition-all hex-clip tracking-wider"
                style={{ borderColor: 'var(--c-secondary)', color: 'var(--c-secondary)', fontFamily: 'var(--font-display)' }}>
                {walletAddress ? `${walletAddress.slice(0, 8)}...` : 'CONNECT_WALLET'}
              </button>
              <div className="flex gap-2">
                <button onClick={onSoundToggle}
                  className="flex-1 py-2.5 text-xs border transition-all"
                  style={{ borderColor: 'var(--c-border)', color: soundMuted ? 'var(--c-danger)' : 'var(--c-text-dim)', fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}>
                  SFX:{soundMuted ? 'OFF' : 'ON'}
                </button>
                <button onClick={onBGMToggle}
                  className="flex-1 py-2.5 text-xs border transition-all"
                  style={{ borderColor: bgmPlaying ? 'var(--c-purple)' : 'var(--c-border)', color: bgmPlaying ? 'var(--c-purple)' : 'var(--c-text-dim)', fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}>
                  BGM:{bgmPlaying ? 'ON' : 'OFF'}
                </button>
              </div>
              <button onClick={() => { onLeaderboard(); setOpen(false) }}
                className="w-full py-2.5 text-xs border transition-all tracking-wider"
                style={{ borderColor: 'var(--c-warning)', color: 'var(--c-warning)', fontFamily: 'var(--font-display)' }}>
                LEADERBOARD
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
