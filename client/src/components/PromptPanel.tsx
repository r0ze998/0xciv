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
    <div className="rounded border p-4 corner-deco"
      style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}>
      <label className="text-[10px] block mb-2 tracking-widest uppercase"
        style={{ color: 'var(--c-text-dim)', fontFamily: 'var(--font-display)' }}>
        STRATEGY_PROMPT // COMMAND YOUR AI
      </label>
      <PromptHint civ={playerCiv} allCivs={allCivs} />
      <div className="flex gap-1 mb-2 flex-wrap">
        {PRESET_STRATEGIES.map(([label, text]) => (
          <button key={label} onClick={() => setPrompt(text)}
            className="px-2 py-0.5 text-[10px] border transition-all hover:scale-105"
            style={{
              borderColor: 'var(--c-border)',
              color: 'var(--c-text-dim)',
              backgroundColor: 'var(--c-surface-alt)',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--c-secondary)'; e.currentTarget.style.color = 'var(--c-secondary)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--c-border)'; e.currentTarget.style.color = 'var(--c-text-dim)' }}
          >{label}</button>
        ))}
      </div>
      <textarea
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        placeholder="> e.g. Prioritize food. If attacked, retaliate. Never trade with the weakest..."
        className="w-full h-24 rounded border p-3 text-sm resize-none focus:outline-none"
        style={{
          backgroundColor: 'var(--c-bg)',
          borderColor: 'var(--c-border)',
          color: 'var(--c-text)',
          fontFamily: 'var(--font-mono)',
        }}
      />
      <div className="flex gap-2 mt-2 items-center">
        <button onClick={onSavePrompt}
          className="px-4 py-2 text-[10px] font-bold border transition-all hex-clip tracking-wider"
          style={{
            borderColor: 'var(--c-secondary)',
            color: 'var(--c-secondary)',
            backgroundColor: 'transparent',
            fontFamily: 'var(--font-display)',
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(0, 212, 255, 0.08)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
        >SAVE</button>
        <button onClick={onNextTurn} disabled={disabled}
          className="flex-1 py-2 text-[10px] font-bold border-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 hex-clip tracking-wider"
          style={{
            borderColor: 'var(--c-primary)',
            color: 'var(--c-primary)',
            backgroundColor: 'rgba(0, 255, 65, 0.06)',
            boxShadow: '0 0 15px rgba(0, 255, 65, 0.1)',
            fontFamily: 'var(--font-display)',
          }}
        >{dataSource === 'torii' ? 'REFRESH_STATE' : 'NEXT_TURN >>'}</button>
        <AutoPlayToggle enabled={autoPlay} speed={autoSpeed}
          onToggle={onAutoToggle} onSpeedChange={onSpeedChange} />
      </div>
    </div>
  )
}
