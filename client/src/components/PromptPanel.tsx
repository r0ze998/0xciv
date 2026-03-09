import { PromptHint } from './PromptHint'
import { AutoPlayToggle } from './AutoPlayToggle'
import { PRESET_STRATEGIES } from '../lib/constants'
import type { Civilization } from '../types/game'

interface Props {
  prompt: string
  setPrompt: (p: string) => void
  playerCiv: Civilization
  allCivs: Civilization[]
  onSavePrompt: () => void
  onNextTurn: () => void
  disabled: boolean
  dataSource: string
  autoPlay: boolean
  autoSpeed: number
  onAutoToggle: () => void
  onSpeedChange: (speed: number) => void
}

export function PromptPanel({
  prompt, setPrompt, playerCiv, allCivs,
  onSavePrompt, onNextTurn, disabled, dataSource,
  autoPlay, autoSpeed, onAutoToggle, onSpeedChange,
}: Props) {
  return (
    <div className="bg-gray-900/80 rounded-lg border border-gray-700 p-4">
      <label className="text-gray-400 text-sm block mb-2">Strategy Prompt — Tell your AI how to lead</label>
      <PromptHint civ={playerCiv} allCivs={allCivs} />
      <div className="flex gap-1 mb-2 flex-wrap">
        {PRESET_STRATEGIES.map(([label, text]) => (
          <button key={label} onClick={() => setPrompt(text)}
            className="px-2 py-0.5 rounded text-xs bg-gray-800 border border-gray-600 text-gray-400 hover:border-cyan-500 hover:text-cyan-400 transition-all"
          >{label}</button>
        ))}
      </div>
      <textarea
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        placeholder="e.g. Prioritize food. If attacked, retaliate. Never trade with the weakest..."
        className="w-full h-24 bg-gray-800 rounded border border-gray-600 p-3 text-sm text-gray-200 placeholder-gray-600 focus:border-cyan-500 focus:outline-none resize-none font-mono"
      />
      <div className="flex gap-2 mt-2 items-center">
        <button onClick={onSavePrompt}
          className="px-4 py-2 rounded text-sm font-bold bg-gray-800 border border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 transition-all"
        >Save Prompt</button>
        <button onClick={onNextTurn} disabled={disabled}
          className="flex-1 py-2 rounded text-sm font-bold bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:from-cyan-400 hover:to-fuchsia-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
        >{dataSource === 'torii' ? '🔄 REFRESH' : '⏩ NEXT TURN'}</button>
        <AutoPlayToggle enabled={autoPlay} speed={autoSpeed}
          onToggle={onAutoToggle} onSpeedChange={onSpeedChange} />
      </div>
    </div>
  )
}
