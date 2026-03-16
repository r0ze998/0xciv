import { useState } from 'react'
import { COLORS } from '../lib/constants'

interface Props {
  dataSource: 'loading' | 'torii' | 'mock'
  onStart: (names?: string[]) => void
  onSpectate: () => void
  onTutorial?: () => void
}

export function LobbyScreen({ dataSource, onStart, onSpectate, onTutorial }: Props) {
  const [names, setNames] = useState(COLORS.map(c => c.name))
  const [editing, setEditing] = useState<number | null>(null)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 scanline crt-lines"
      style={{ backgroundColor: 'var(--c-bg)', color: 'var(--c-text)', fontFamily: 'var(--font-body)' }}>
      <div className="animate-fade-up">
        <h1 className="text-6xl sm:text-8xl font-black mb-1 tracking-widest title-glow text-center glitch-text" data-text="0xCIV"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--c-primary)' }}>0xCIV</h1>
        <p className="mb-8 text-sm tracking-[0.3em] text-center uppercase"
          style={{ color: 'var(--c-text-dim)', fontFamily: 'var(--font-display)', fontSize: '10px' }}>
          // YOUR WORDS SHAPE CIVILIZATIONS
        </p>
      </div>

      <div className="flex gap-1.5 mb-3 animate-fade-up-delay-1 flex-wrap justify-center">
        {[
          { label: 'CLASSIC', names: ['Cyan Empire', 'Magenta Dominion', 'Gold Republic', 'Jade Federation'] },
          { label: 'WARRIORS', names: ['Starknet Legion', 'Cairo Guard', 'Dojo Order', 'Blockchain Horde'] },
          { label: 'NIHON', names: ['織田軍団', '武田騎馬隊', '上杉連合', '毛利水軍'] },
          { label: 'SCI-FI', names: ['Neon Syndicate', 'Void Collective', 'Quantum Nexus', 'Solar Imperium'] },
        ].map(pack => (
          <button
            key={pack.label}
            onClick={() => setNames(pack.names)}
            className="px-2.5 py-1 text-[9px] tracking-wider border transition-all hex-clip hover:scale-105"
            style={{
              borderColor: 'var(--c-border-bright)',
              color: 'var(--c-text-dim)',
              backgroundColor: 'var(--c-surface)',
              fontFamily: 'var(--font-display)',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--c-secondary)'; e.currentTarget.style.color = 'var(--c-secondary)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--c-border-bright)'; e.currentTarget.style.color = 'var(--c-text-dim)' }}
          >
            {pack.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8 animate-fade-up-delay-1">
        {COLORS.map((c, i) => (
          <div key={i}
            className="px-5 py-3 border text-center transition-all hover:scale-105 cursor-pointer corner-deco hex-clip"
            style={{
              borderColor: `${c.color}66`,
              color: c.color,
              boxShadow: `0 0 20px ${c.color}15, inset 0 0 30px ${c.color}08`,
              backgroundColor: `${c.color}08`,
            }}
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
                style={{ color: c.color, borderColor: c.color, fontFamily: 'var(--font-mono)' }}
                maxLength={20}
              />
            ) : (
              <span className="text-sm">{names[i]}</span>
            )}
          </div>
        ))}
      </div>

      <div className="animate-fade-up-delay-2">
        <button
          onClick={() => onStart(names)}
          className="cyber-btn text-sm tracking-widest border-2 hover:scale-105 active:scale-95 transition-all"
          style={{
            borderColor: 'var(--c-primary)',
            color: 'var(--c-primary)',
            backgroundColor: 'rgba(0, 255, 65, 0.08)',
            boxShadow: '0 0 30px rgba(0, 255, 65, 0.2), inset 0 0 20px rgba(0, 255, 65, 0.05)',
            fontFamily: 'var(--font-display)',
            padding: '14px 40px',
          }}
        >
          INITIALIZE GAME
        </button>
      </div>

      <p className="text-xs mt-4 flex items-center justify-center gap-2 animate-fade-up-delay-2"
        style={{ color: 'var(--c-text-dim)' }}>
        {dataSource === 'loading' && <span className="animate-spin">&#9881;</span>}
        {dataSource === 'torii' ? <><span className="w-1.5 h-1.5 rounded-full bg-green-500 status-online" /> TORII_CONNECTED</> :
         dataSource === 'mock' ? <><span className="w-1.5 h-1.5 rounded-full bg-yellow-500" /> MOCK_MODE</> :
         <><span className="typing-cursor" /> CONNECTING...</>}
      </p>

      <div className="mt-6 max-w-md text-left rounded border p-4 animate-fade-up-delay-3 corner-deco data-stream-bg"
        style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}>
        <h3 className="text-xs font-bold mb-2 tracking-widest neon-cyan" style={{ fontFamily: 'var(--font-display)' }}>
          SYS://PROTOCOL
        </h3>
        <ol className="text-xs space-y-1 list-decimal list-inside" style={{ color: 'var(--c-text-dim)' }}>
          <li>Write a <span className="neon-cyan">strategy prompt</span> to command your AI civilization</li>
          <li>Your AI reads on-chain state and decides: gather, attack, defend, or trade</li>
          <li>Last civilization standing wins — <span className="neon-red">HP=0, Food=0, or no territories = eliminated</span></li>
          <li>Opponent prompts are <span className="neon-purple">hidden</span> — information warfare!</li>
        </ol>
        <p className="text-[10px] mt-2 italic" style={{ color: 'var(--c-text-muted)' }}>
          &gt; "Stop fighting bots — design around them"
        </p>
      </div>

      <div className="flex gap-3 mt-4 animate-fade-up-delay-3">
        <button
          onClick={onSpectate}
          className="px-4 py-2 text-xs font-bold border transition-all hover:scale-105 hex-clip"
          style={{
            borderColor: 'var(--c-border-bright)',
            color: 'var(--c-secondary)',
            fontFamily: 'var(--font-display)',
            letterSpacing: '0.1em',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--c-secondary)'; e.currentTarget.style.boxShadow = '0 0 12px rgba(0, 212, 255, 0.2)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--c-border-bright)'; e.currentTarget.style.boxShadow = 'none' }}
        >
          SPECTATE
        </button>
        <button
          onClick={() => onTutorial?.()}
          className="px-4 py-2 text-xs font-bold border transition-all hover:scale-105 hex-clip"
          style={{
            borderColor: 'var(--c-border-bright)',
            color: 'var(--c-purple)',
            fontFamily: 'var(--font-display)',
            letterSpacing: '0.1em',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--c-purple)'; e.currentTarget.style.boxShadow = '0 0 12px rgba(191, 0, 255, 0.2)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--c-border-bright)'; e.currentTarget.style.boxShadow = 'none' }}
        >
          TUTORIAL
        </button>
      </div>

      <p className="text-[9px] mt-4 animate-fade-up-delay-3 tracking-widest"
        style={{ color: 'var(--c-text-muted)', fontFamily: 'var(--font-display)' }}>
        DOJO_GAME_JAM_VIII
      </p>
    </div>
  )
}
