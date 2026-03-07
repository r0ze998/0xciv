interface Props {
  isReplaying: boolean
  replayIndex: number | null
  totalFrames: number
  onStart: () => void
  onStop: () => void
  onNext: () => void
  onPrev: () => void
  onSeek: (index: number) => void
}

export function ReplayControls({ isReplaying, replayIndex, totalFrames, onStart, onStop, onNext, onPrev, onSeek }: Props) {
  if (!isReplaying && totalFrames < 2) return null

  if (!isReplaying) {
    return (
      <button
        onClick={onStart}
        className="px-3 py-1.5 rounded text-xs font-bold border border-purple-500/50 text-purple-400 hover:bg-purple-500/10 transition-all"
      >
        🔄 Replay ({totalFrames} turns)
      </button>
    )
  }

  const progress = replayIndex !== null ? ((replayIndex + 1) / totalFrames) * 100 : 0

  return (
    <div className="bg-gray-900/80 rounded-lg border border-purple-500/30 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-purple-400 text-xs font-bold tracking-wider">🔄 REPLAY MODE</h3>
        <button onClick={onStop} className="text-gray-500 hover:text-white text-xs">✕ Exit</button>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={onPrev} disabled={replayIndex === 0}
          className="px-2 py-1 rounded text-xs border border-gray-700 text-gray-400 hover:text-white disabled:opacity-30 transition-all">⏮</button>
        <button onClick={onNext} disabled={replayIndex === totalFrames - 1}
          className="px-2 py-1 rounded text-xs border border-gray-700 text-gray-400 hover:text-white disabled:opacity-30 transition-all">⏭</button>
        <div className="flex-1">
          <input
            type="range"
            min={0}
            max={totalFrames - 1}
            value={replayIndex ?? 0}
            onChange={e => onSeek(Number(e.target.value))}
            className="w-full h-1 bg-gray-800 rounded-full appearance-none cursor-pointer accent-purple-500"
          />
        </div>
        <span className="text-xs text-purple-400 font-mono w-16 text-right">
          T{replayIndex !== null ? replayIndex + 1 : 0}/{totalFrames}
        </span>
      </div>

      <div className="w-full bg-gray-800 rounded-full h-0.5">
        <div className="h-full rounded-full bg-purple-500 transition-all duration-200" style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}
