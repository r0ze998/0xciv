import { useState } from 'react'
import { executeGather, executeAttack, executeDefend, executeAdvanceTurn, executeCreateGame, executeSpawnCivilization } from '../actions'
import type { Civilization } from '../types/game'

interface Props {
  connected: boolean
  civs: Civilization[]
  selectedCiv: number
  dataSource: 'loading' | 'torii' | 'mock'
  onLog: (message: string, type: 'system' | 'action' | 'combat') => void
}

export function ActionBar({ connected, civs, selectedCiv, dataSource, onLog }: Props) {
  const [loading, setLoading] = useState<string | null>(null)
  const [attackTarget, setAttackTarget] = useState<number>(0)

  if (!connected || dataSource !== 'torii') return null

  const enemies = civs.filter((c, i) => i !== selectedCiv && c.isAlive)

  async function exec(name: string, fn: () => Promise<any>) {
    setLoading(name)
    try {
      await fn()
      onLog(`> ${name} transaction sent`, 'action')
    } catch (err: any) {
      onLog(`> ERR: ${name} failed: ${err.message?.slice(0, 60) || 'Unknown error'}`, 'system')
    } finally {
      setLoading(null)
    }
  }

  const btnStyle = (color: string) => ({
    borderColor: `${color}55`,
    color: color,
    fontFamily: 'var(--font-display)',
    letterSpacing: '0.08em',
    fontSize: '9px',
  })

  return (
    <div className="rounded border p-3" style={{ backgroundColor: 'var(--c-surface)', borderColor: `var(--c-secondary)33` }}>
      <h3 className="text-[9px] font-bold mb-2 tracking-[0.2em] neon-cyan"
        style={{ fontFamily: 'var(--font-display)' }}>
        ON-CHAIN_ACTIONS
      </h3>
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => exec('Create Game', executeCreateGame)}
          disabled={!!loading}
          className="px-2 py-1 border disabled:opacity-30 transition-all hover:scale-105"
          style={btnStyle('var(--c-purple)')}
        >
          {loading === 'Create Game' ? '...' : 'CREATE_GAME'}
        </button>
        <button
          onClick={() => exec('Spawn Civ', executeSpawnCivilization)}
          disabled={!!loading}
          className="px-2 py-1 border disabled:opacity-30 transition-all hover:scale-105"
          style={btnStyle('var(--c-secondary)')}
        >
          {loading === 'Spawn Civ' ? '...' : 'SPAWN_CIV'}
        </button>

        <div className="w-full border-t my-1" style={{ borderColor: 'var(--c-border)' }} />

        <button
          onClick={() => exec('Gather', executeGather)}
          disabled={!!loading}
          className="px-2 py-1 border disabled:opacity-30 transition-all hover:scale-105"
          style={btnStyle('var(--c-primary)')}
        >
          {loading === 'Gather' ? '...' : 'GATHER'}
        </button>
        <button
          onClick={() => exec('Defend', executeDefend)}
          disabled={!!loading}
          className="px-2 py-1 border disabled:opacity-30 transition-all hover:scale-105"
          style={btnStyle('var(--c-secondary)')}
        >
          {loading === 'Defend' ? '...' : 'DEFEND'}
        </button>

        {enemies.length > 0 && (
          <div className="flex items-center gap-1">
            <select
              value={attackTarget}
              onChange={e => setAttackTarget(Number(e.target.value))}
              className="border px-1 py-1 text-[9px]"
              style={{ backgroundColor: 'var(--c-bg)', borderColor: 'var(--c-border)', color: 'var(--c-text-dim)' }}
            >
              {enemies.map(c => (
                <option key={c.id} value={c.id + 1}>#{c.id + 1} {c.name.split(' ')[0]}</option>
              ))}
            </select>
            <button
              onClick={() => exec('Attack', () => executeAttack(attackTarget || enemies[0].id + 1))}
              disabled={!!loading}
              className="px-2 py-1 border disabled:opacity-30 transition-all hover:scale-105"
              style={btnStyle('var(--c-danger)')}
            >
              {loading === 'Attack' ? '...' : 'ATTACK'}
            </button>
          </div>
        )}

        <button
          onClick={() => exec('Advance Turn', executeAdvanceTurn)}
          disabled={!!loading}
          className="px-2 py-1 border disabled:opacity-30 transition-all hover:scale-105"
          style={btnStyle('var(--c-purple)')}
        >
          {loading === 'Advance Turn' ? '...' : 'ADVANCE_TURN'}
        </button>
      </div>
    </div>
  )
}
