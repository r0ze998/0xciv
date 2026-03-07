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
      onLog(`⛓️ ${name} transaction sent!`, 'action')
    } catch (err: any) {
      onLog(`❌ ${name} failed: ${err.message?.slice(0, 60) || 'Unknown error'}`, 'system')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="bg-gray-900/80 rounded-lg border border-fuchsia-500/30 p-3">
      <h3 className="text-fuchsia-400 text-xs font-bold mb-2 tracking-wider flex items-center gap-1">
        ⛓️ ON-CHAIN ACTIONS
      </h3>
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => exec('Create Game', executeCreateGame)}
          disabled={!!loading}
          className="px-2 py-1 rounded text-[10px] font-bold border border-purple-500/50 text-purple-400 hover:bg-purple-500/10 disabled:opacity-30 transition-all"
        >
          {loading === 'Create Game' ? '⏳' : '🌍'} Create Game
        </button>
        <button
          onClick={() => exec('Spawn Civ', executeSpawnCivilization)}
          disabled={!!loading}
          className="px-2 py-1 rounded text-[10px] font-bold border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 disabled:opacity-30 transition-all"
        >
          {loading === 'Spawn Civ' ? '⏳' : '🏛️'} Spawn Civ
        </button>

        <div className="w-full border-t border-gray-800 my-1" />

        <button
          onClick={() => exec('Gather', executeGather)}
          disabled={!!loading}
          className="px-2 py-1 rounded text-[10px] font-bold border border-green-500/50 text-green-400 hover:bg-green-500/10 disabled:opacity-30 transition-all"
        >
          {loading === 'Gather' ? '⏳' : '🍞'} Gather
        </button>
        <button
          onClick={() => exec('Defend', executeDefend)}
          disabled={!!loading}
          className="px-2 py-1 rounded text-[10px] font-bold border border-blue-500/50 text-blue-400 hover:bg-blue-500/10 disabled:opacity-30 transition-all"
        >
          {loading === 'Defend' ? '⏳' : '🛡️'} Defend
        </button>

        {enemies.length > 0 && (
          <div className="flex items-center gap-1">
            <select
              value={attackTarget}
              onChange={e => setAttackTarget(Number(e.target.value))}
              className="bg-gray-800 border border-gray-700 rounded text-[10px] text-gray-400 px-1 py-1"
            >
              {enemies.map(c => (
                <option key={c.id} value={c.id + 1}>#{c.id + 1} {c.name.split(' ')[0]}</option>
              ))}
            </select>
            <button
              onClick={() => exec('Attack', () => executeAttack(attackTarget || enemies[0].id + 1))}
              disabled={!!loading}
              className="px-2 py-1 rounded text-[10px] font-bold border border-red-500/50 text-red-400 hover:bg-red-500/10 disabled:opacity-30 transition-all"
            >
              {loading === 'Attack' ? '⏳' : '⚔️'} Attack
            </button>
          </div>
        )}

        <button
          onClick={() => exec('Advance Turn', executeAdvanceTurn)}
          disabled={!!loading}
          className="px-2 py-1 rounded text-[10px] font-bold border border-fuchsia-500/50 text-fuchsia-400 hover:bg-fuchsia-500/10 disabled:opacity-30 transition-all"
        >
          {loading === 'Advance Turn' ? '⏳' : '⏩'} Advance Turn
        </button>
      </div>
    </div>
  )
}
