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
    <div className="flex items-center justify-between px-3 sm:px-6 py-2 sm:py-3 border-b border-gray-800">
      <h1 className="text-lg sm:text-2xl font-black tracking-wider shrink-0" style={{
        background: 'linear-gradient(135deg, #00ffff, #ff00ff)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>0xCIV</h1>
      <div className="flex items-center gap-1.5 sm:gap-3 flex-wrap justify-end">
        <span className="hidden sm:flex"><MiniStats civs={civs} turn={turn} /></span>
        <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded ${dataSource === 'torii' ? 'bg-green-900 text-green-400' : 'bg-yellow-900 text-yellow-400'}`}>
          {dataSource === 'torii' ? 'ON-CHAIN' : 'MOCK'}
        </span>
        <span className="text-cyan-400 text-xs sm:text-sm font-mono font-bold">T{turn}</span>
        <GameClock isPlaying={isPlaying && !winner} />
        {isReplaying && <span className="text-purple-400 text-[10px] font-bold animate-pulse">REPLAY</span>}
        <button onClick={onBGMToggle}
          className={`p-1 sm:px-2 sm:py-1 rounded text-xs border transition-all ${bgmPlaying ? 'border-fuchsia-500 text-fuchsia-400' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}
          title={bgmPlaying ? 'Stop BGM' : 'Play BGM'}
        >{bgmPlaying ? '🎵' : '🎶'}</button>
        <button onClick={onSoundToggle}
          className="p-1 sm:px-2 sm:py-1 rounded text-xs border border-gray-700 text-gray-400 hover:border-gray-500 transition-all"
          title={soundMuted ? 'Unmute SFX' : 'Mute SFX'}
        >{soundMuted ? '🔇' : '🔊'}</button>
        <button
          onClick={async () => {
            if (walletAddress) { await disconnectWallet(); setWalletAddress(null) }
            else { try { const acct = await connectWallet(); if (acct?.account) setWalletAddress(acct.account) } catch {} }
          }}
          className="px-2 sm:px-3 py-1 rounded text-[10px] sm:text-xs font-bold border border-fuchsia-500 text-fuchsia-400 hover:bg-fuchsia-500/10 transition-all"
        >{walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : '🔗'}</button>
      </div>
    </div>
  )
}
