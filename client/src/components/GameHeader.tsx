import { connectWallet, disconnectWallet } from '../cartridge'
import { MiniStats } from './MiniStats'
import { GameClock } from './GameClock'
import type { Civilization } from '../types/game'

interface Props {
  civs: Civilization[]
  turn: number
  dataSource: string
  isPlaying: boolean
  winner: Civilization | null
  isReplaying: boolean
  walletAddress: string | null
  setWalletAddress: (addr: string | null) => void
  bgmPlaying: boolean
  onBGMToggle: () => void
  soundMuted: boolean
  onSoundToggle: () => void
}

export function GameHeader({
  civs, turn, dataSource, isPlaying, winner, isReplaying,
  walletAddress, setWalletAddress, bgmPlaying, onBGMToggle,
  soundMuted, onSoundToggle,
}: Props) {
  return (
    <div className="flex items-center justify-between px-3 sm:px-6 py-2 sm:py-3 border-b h-scan-line"
      style={{ borderColor: 'var(--c-border)', backgroundColor: 'rgba(10,10,15,0.9)' }}>
      <h1 className="text-lg sm:text-2xl font-black tracking-widest shrink-0 hover-chromatic"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--c-primary)',
          textShadow: '0 0 10px rgba(0,255,65,0.4)' }}>
        0xCIV
      </h1>
      <div className="flex items-center gap-1.5 sm:gap-3 flex-wrap justify-end">
        <span className="hidden sm:flex"><MiniStats civs={civs} turn={turn} /></span>
        <span className={`text-[9px] px-1.5 sm:px-2 py-0.5 tracking-wider border ${
          dataSource === 'torii'
            ? 'border-green-500/40 neon-green'
            : 'border-yellow-500/40'
        }`} style={{ fontFamily: 'var(--font-display)', color: dataSource === 'torii' ? 'var(--c-primary)' : 'var(--c-warning)' }}>
          {dataSource === 'torii' ? 'ON-CHAIN' : 'MOCK'}
        </span>
        <span className="text-xs sm:text-sm font-bold neon-cyan" style={{ fontFamily: 'var(--font-mono)' }}>T{turn}</span>
        <GameClock isPlaying={isPlaying && !winner} />
        {isReplaying && <span className="text-[10px] font-bold animate-glow-pulse neon-purple">REPLAY</span>}
        <button onClick={onBGMToggle}
          className="p-1 sm:px-2 sm:py-1 text-xs border transition-all"
          style={{
            borderColor: bgmPlaying ? 'var(--c-purple)' : 'var(--c-border)',
            color: bgmPlaying ? 'var(--c-purple)' : 'var(--c-text-dim)',
          }}
          title={bgmPlaying ? 'Stop BGM' : 'Play BGM'}
        >{bgmPlaying ? 'BGM:ON' : 'BGM'}</button>
        <button onClick={onSoundToggle}
          className="p-1 sm:px-2 sm:py-1 text-xs border transition-all"
          style={{ borderColor: 'var(--c-border)', color: soundMuted ? 'var(--c-danger)' : 'var(--c-text-dim)' }}
          title={soundMuted ? 'Unmute SFX' : 'Mute SFX'}
        >{soundMuted ? 'SFX:OFF' : 'SFX:ON'}</button>
        <button
          onClick={async () => {
            if (walletAddress) { await disconnectWallet(); setWalletAddress(null) }
            else { try { const acct = await connectWallet(); if (acct?.account) setWalletAddress(acct.account) } catch {} }
          }}
          className="px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-bold border transition-all hex-clip"
          style={{ borderColor: 'var(--c-secondary)', color: 'var(--c-secondary)', fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}
        >{walletAddress ? `${walletAddress.slice(0, 6)}..${walletAddress.slice(-4)}` : 'CONNECT'}</button>
      </div>
    </div>
  )
}
