interface Props {
  enabled: boolean
  speed: number
  onToggle: () => void
  onSpeedChange: (speed: number) => void
}

export function AutoPlayToggle({ enabled, speed, onToggle, onSpeedChange }: Props) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onToggle}
        className={`px-3 py-1.5 rounded text-xs font-bold border transition-all ${
          enabled
            ? 'border-green-500 text-green-400 bg-green-500/10 animate-pulse'
            : 'border-gray-600 text-gray-400 hover:border-gray-500'
        }`}
      >
        {enabled ? '⏸ AUTO' : '▶ AUTO'}
      </button>
      {enabled && (
        <select
          value={speed}
          onChange={e => onSpeedChange(Number(e.target.value))}
          className="bg-gray-800 border border-gray-700 rounded text-xs text-gray-400 px-1 py-1"
        >
          <option value={500}>Fast</option>
          <option value={1500}>Normal</option>
          <option value={3000}>Slow</option>
        </select>
      )}
    </div>
  )
}
