import { useState, useRef, useEffect, useCallback } from 'react'
import { fetchAllOnChainData } from './torii'
import type { OnChainCivilization, OnChainTerritory } from './torii'
import { connectWallet, disconnectWallet } from './cartridge'

// Types
type ResourceType = 'food' | 'metal' | 'knowledge'
type Phase = 'lobby' | 'playing' | 'ended'

interface Territory {
  x: number
  y: number
  owner: number | null
  resource: ResourceType
}

interface Civilization {
  id: number
  name: string
  color: string
  neonClass: string
  hp: number
  maxHp: number
  food: number
  metal: number
  knowledge: number
  territories: number
  isAlive: boolean
  prompt: string
}

interface LogEntry {
  turn: number
  message: string
  type: 'action' | 'combat' | 'trade' | 'elimination' | 'system'
}

// Constants
const GRID_SIZE = 5
const COLORS = [
  { color: '#00ffff', neonClass: 'text-cyan-400 border-cyan-400', bg: 'bg-cyan-900/60', name: 'Cyan Empire' },
  { color: '#ff00ff', neonClass: 'text-fuchsia-400 border-fuchsia-400', bg: 'bg-fuchsia-900/60', name: 'Magenta Dominion' },
  { color: '#facc15', neonClass: 'text-yellow-400 border-yellow-400', bg: 'bg-yellow-900/60', name: 'Gold Republic' },
  { color: '#4ade80', neonClass: 'text-green-400 border-green-400', bg: 'bg-green-900/60', name: 'Jade Federation' },
]
const RESOURCE_ICONS: Record<ResourceType, string> = { food: '🍞', metal: '⚒️', knowledge: '📚' }
const RESOURCE_MAP: ResourceType[] = ['food', 'metal', 'knowledge']

// Convert on-chain data to UI models
function onChainCivToUI(civ: OnChainCivilization, index: number): Civilization {
  const colorInfo = COLORS[index] || COLORS[0]
  return {
    id: index,
    name: colorInfo.name,
    color: colorInfo.color,
    neonClass: colorInfo.neonClass,
    hp: civ.hp,
    maxHp: 100,
    food: civ.food,
    metal: civ.metal,
    knowledge: civ.knowledge,
    territories: civ.territory_count,
    isAlive: civ.is_alive,
    prompt: '',
  }
}

function parseResourceType(rt: string | number): ResourceType {
  if (typeof rt === 'string') {
    const lower = rt.toLowerCase()
    if (lower === 'metal') return 'metal'
    if (lower === 'knowledge') return 'knowledge'
    return 'food'
  }
  return RESOURCE_MAP[rt] || 'food'
}

function onChainTerritoriesToGrid(territories: OnChainTerritory[]): Territory[][] {
  const grid: Territory[][] = Array.from({ length: GRID_SIZE }, (_, y) =>
    Array.from({ length: GRID_SIZE }, (_, x) => ({
      x, y, owner: null, resource: 'food' as ResourceType,
    }))
  )
  for (const t of territories) {
    if (t.x < GRID_SIZE && t.y < GRID_SIZE) {
      grid[t.y][t.x] = {
        x: t.x,
        y: t.y,
        owner: t.owner_civ_id > 0 ? t.owner_civ_id - 1 : null, // civ_id is 1-indexed on-chain
        resource: parseResourceType(t.resource_type),
      }
    }
  }
  return grid
}

function gamePhaseToUI(phase: number | string): Phase {
  if (phase === 0 || phase === 'Setup') return 'lobby'
  if (phase === 2 || phase === 'Ended') return 'ended'
  return 'playing'
}

// Generate initial grid (mock fallback)
function generateGrid(): Territory[][] {
  const resources: ResourceType[] = ['food', 'metal', 'knowledge']
  return Array.from({ length: GRID_SIZE }, (_, y) =>
    Array.from({ length: GRID_SIZE }, (_, x) => ({
      x, y,
      owner: null,
      resource: resources[Math.floor(Math.random() * 3)],
    }))
  )
}

function generateCivs(): Civilization[] {
  return COLORS.map((c, i) => ({
    id: i,
    name: c.name,
    color: c.color,
    neonClass: c.neonClass,
    hp: 100,
    maxHp: 100,
    food: 50,
    metal: 30,
    knowledge: 10,
    territories: 1,
    isAlive: true,
    prompt: '',
  }))
}

function assignStartingTerritories(grid: Territory[][]): Territory[][] {
  const corners = [[0, 0], [4, 0], [0, 4], [4, 4]]
  const newGrid = grid.map(row => row.map(t => ({ ...t })))
  corners.forEach(([x, y], i) => { newGrid[y][x].owner = i })
  return newGrid
}

// Simulate a turn (mock fallback)
function simulateTurn(
  civs: Civilization[],
  grid: Territory[][],
  turn: number
): { civs: Civilization[]; grid: Territory[][]; logs: LogEntry[] } {
  const newCivs = civs.map(c => ({ ...c }))
  const newGrid = grid.map(row => row.map(t => ({ ...t })))
  const logs: LogEntry[] = []

  const actions = ['gather', 'attack', 'defend', 'trade']
  const alive = newCivs.filter(c => c.isAlive)

  alive.forEach(civ => {
    const action = actions[Math.floor(Math.random() * actions.length)]
    const c = newCivs[civ.id]

    if (action === 'gather') {
      const bonus = Math.floor(Math.random() * 15) + 5
      const res = (['food', 'metal', 'knowledge'] as ResourceType[])[Math.floor(Math.random() * 3)]
      c[res] += bonus
      logs.push({ turn, message: `${c.name} gathered +${bonus} ${RESOURCE_ICONS[res]} ${res}`, type: 'action' })
    } else if (action === 'attack') {
      const targets = alive.filter(t => t.id !== civ.id)
      if (targets.length > 0) {
        const target = targets[Math.floor(Math.random() * targets.length)]
        const t = newCivs[target.id]
        const dmg = Math.floor(Math.random() * 20) + 5
        t.hp = Math.max(0, t.hp - dmg)
        c.metal = Math.max(0, c.metal - 5)
        logs.push({ turn, message: `${c.name} attacked ${t.name} for ${dmg} damage!`, type: 'combat' })
        if (Math.random() > 0.6) {
          const targetTerritories = newGrid.flat().filter(tt => tt.owner === target.id)
          if (targetTerritories.length > 0) {
            const captured = targetTerritories[Math.floor(Math.random() * targetTerritories.length)]
            newGrid[captured.y][captured.x].owner = civ.id
            c.territories++
            t.territories = Math.max(0, t.territories - 1)
            logs.push({ turn, message: `${c.name} captured territory (${captured.x},${captured.y}) from ${t.name}!`, type: 'combat' })
          }
        }
      }
    } else if (action === 'defend') {
      c.hp = Math.min(c.maxHp, c.hp + 5)
      logs.push({ turn, message: `${c.name} fortified defenses (+5 HP)`, type: 'action' })
    } else {
      c.food += 8
      c.knowledge += 3
      logs.push({ turn, message: `${c.name} traded resources (+8 food, +3 knowledge)`, type: 'trade' })
    }

    c.food = Math.max(0, c.food - 3)
  })

  newCivs.forEach(c => {
    if (!c.isAlive) return
    if (c.hp <= 0 || c.food <= 0 || c.territories <= 0) {
      c.isAlive = false
      const reason = c.hp <= 0 ? 'HP reached 0' : c.food <= 0 ? 'starvation' : 'all territories lost'
      logs.push({ turn, message: `${c.name} has been eliminated! (${reason})`, type: 'elimination' })
    }
  })

  return { civs: newCivs, grid: newGrid, logs }
}

// Components
function HPBar({ hp, maxHp, color }: { hp: number; maxHp: number; color: string }) {
  const pct = (hp / maxHp) * 100
  return (
    <div className="w-full bg-gray-800 rounded-full h-3 border border-gray-700">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, backgroundColor: pct > 50 ? color : pct > 25 ? '#f59e0b' : '#ef4444' }}
      />
    </div>
  )
}

function GridMap({ grid, civs, selectedCiv }: { grid: Territory[][]; civs: Civilization[]; selectedCiv: number }) {
  return (
    <div className="grid grid-cols-5 gap-1 p-2 bg-gray-900/80 rounded-lg border border-gray-700">
      {grid.flat().map((t) => {
        const owner = t.owner !== null ? civs[t.owner] : null
        const isSelected = t.owner === selectedCiv
        return (
          <div
            key={`${t.x}-${t.y}`}
            className={`aspect-square flex items-center justify-center rounded text-lg font-bold transition-all
              ${owner ? '' : 'bg-gray-800/60'}
              ${isSelected ? 'ring-2 ring-white/50 scale-105' : ''}
            `}
            style={{
              backgroundColor: owner ? `${owner.color}22` : undefined,
              borderWidth: 1,
              borderColor: owner ? owner.color : '#374151',
              boxShadow: owner ? `0 0 8px ${owner.color}44` : 'none',
            }}
          >
            <span className="text-sm">{RESOURCE_ICONS[t.resource]}</span>
          </div>
        )
      })}
    </div>
  )
}

function TurnLog({ logs }: { logs: LogEntry[] }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => { ref.current?.scrollTo(0, ref.current.scrollHeight) }, [logs])

  const typeColor: Record<string, string> = {
    action: 'text-gray-300',
    combat: 'text-red-400',
    trade: 'text-blue-400',
    elimination: 'text-yellow-400',
    system: 'text-purple-400',
  }

  return (
    <div ref={ref} className="h-64 overflow-y-auto bg-gray-900/80 rounded-lg border border-gray-700 p-3 font-mono text-xs space-y-1">
      {logs.length === 0 && <p className="text-gray-600 italic">Waiting for first turn...</p>}
      {logs.map((log, i) => (
        <div key={i} className={typeColor[log.type] || 'text-gray-400'}>
          <span className="text-gray-600">[T{log.turn}]</span> {log.message}
        </div>
      ))}
    </div>
  )
}

function ResourcePanel({ civ }: { civ: Civilization }) {
  return (
    <div className="bg-gray-900/80 rounded-lg border p-4 space-y-3" style={{ borderColor: civ.color }}>
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg" style={{ color: civ.color }}>{civ.name}</h3>
        {!civ.isAlive && <span className="text-red-500 text-xs font-bold">ELIMINATED</span>}
      </div>
      <div>
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>HP</span><span>{civ.hp}/{civ.maxHp}</span>
        </div>
        <HPBar hp={civ.hp} maxHp={civ.maxHp} color={civ.color} />
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center gap-1"><span>🍞</span><span className="text-gray-300">{civ.food}</span></div>
        <div className="flex items-center gap-1"><span>⚒️</span><span className="text-gray-300">{civ.metal}</span></div>
        <div className="flex items-center gap-1"><span>📚</span><span className="text-gray-300">{civ.knowledge}</span></div>
        <div className="flex items-center gap-1"><span>🏴</span><span className="text-gray-300">{civ.territories}</span></div>
      </div>
    </div>
  )
}

// Main App
export default function App() {
  const [phase, setPhase] = useState<Phase>('lobby')
  const [grid, setGrid] = useState<Territory[][]>(() => assignStartingTerritories(generateGrid()))
  const [civs, setCivs] = useState<Civilization[]>(generateCivs)
  const [turn, setTurn] = useState(0)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [selectedCiv, setSelectedCiv] = useState(0)
  const [prompt, setPrompt] = useState('')
  const [winner, setWinner] = useState<Civilization | null>(null)
  const [dataSource, setDataSource] = useState<'loading' | 'torii' | 'mock'>('loading')
  const [walletAddress, setWalletAddress] = useState<string | null>(null)

  const playerCiv = civs[selectedCiv]

  // Try to load on-chain data from Torii
  const syncFromTorii = useCallback(async () => {
    try {
      const { gameState, civs: onChainCivs, territories, events } = await fetchAllOnChainData(1)

      if (!gameState || onChainCivs.length === 0) {
        if (dataSource === 'loading') {
          setDataSource('mock')
          setLogs(prev => [...prev, { turn: 0, message: 'No on-chain game found. Using mock simulation.', type: 'system' }])
        }
        return
      }

      // Convert on-chain data to UI format
      const uiCivs = onChainCivs
        .sort((a, b) => a.civ_id - b.civ_id)
        .map((c, i) => onChainCivToUI(c, i))

      const uiGrid = onChainTerritoriesToGrid(territories)
      const uiPhase = gamePhaseToUI(gameState.game_phase)

      setCivs(prev => {
        // Preserve prompts from previous state
        return uiCivs.map((c, i) => ({ ...c, prompt: prev[i]?.prompt || '' }))
      })
      setGrid(uiGrid)
      setTurn(gameState.turn_number)
      setPhase(uiPhase)

      if (uiPhase === 'ended') {
        const alive = uiCivs.find(c => c.isAlive)
        if (alive) setWinner(alive)
      }

      // Convert on-chain events to log entries
      if (events && events.length > 0) {
        const eventLogs: LogEntry[] = events.map(e => {
          if (e.type === 'action') {
            return { turn: e.turn || 0, message: `Civ #${e.civ_id} performed ${e.action}`, type: 'system' as const }
          } else if (e.type === 'combat') {
            return { turn: 0, message: `⚔️ Civ #${e.attacker_civ} attacked Civ #${e.defender_civ} — ${e.attacker_won ? 'Victory' : 'Repelled'}! ${e.hp_damage} damage`, type: 'combat' as const }
          } else if (e.type === 'elimination') {
            return { turn: 0, message: `☠️ Civ #${e.civ_id} has been eliminated!`, type: 'elimination' as const }
          }
          return { turn: 0, message: `Trade event`, type: 'trade' as const }
        })
        setLogs(eventLogs)
      }

      if (dataSource !== 'torii') {
        setDataSource('torii')
        setLogs(prev => [...prev, { turn: 0, message: 'Connected to Torii. Showing on-chain data.', type: 'system' }])
      }
    } catch {
      if (dataSource === 'loading') {
        setDataSource('mock')
        setLogs(prev => [...prev, { turn: 0, message: 'Torii unavailable. Using mock simulation.', type: 'system' }])
      }
    }
  }, [dataSource])

  // Initial load + polling
  useEffect(() => {
    syncFromTorii()
    const interval = setInterval(syncFromTorii, 3000)
    return () => clearInterval(interval)
  }, [syncFromTorii])

  function startGame() {
    setPhase('playing')
    setLogs(prev => [...prev, { turn: 0, message: 'The world awakens. Four civilizations emerge from the void.', type: 'system' }])
  }

  function nextTurn() {
    if (winner) return
    if (dataSource === 'torii') {
      // In Torii mode, just refresh — turns are advanced on-chain
      syncFromTorii()
      setLogs(prev => [...prev, { turn, message: 'Syncing on-chain state...', type: 'system' }])
      return
    }
    // Mock simulation fallback
    const newTurn = turn + 1
    const result = simulateTurn(civs, grid, newTurn)
    setCivs(result.civs)
    setGrid(result.grid)
    setLogs(prev => [...prev, ...result.logs])
    setTurn(newTurn)

    const alive = result.civs.filter(c => c.isAlive)
    if (alive.length <= 1 && result.civs.length > 1) {
      const w = alive[0] || result.civs[0]
      setWinner(w)
      setPhase('ended')
      setLogs(prev => [...prev, { turn: newTurn, message: `${w.name} is the last civilization standing!`, type: 'system' }])
    }
  }

  function savePrompt() {
    const updated = [...civs]
    updated[selectedCiv] = { ...updated[selectedCiv], prompt }
    setCivs(updated)
    setLogs(prev => [...prev, { turn, message: `${playerCiv.name} updated their strategy prompt`, type: 'system' }])
  }

  // Lobby screen
  if (phase === 'lobby') {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white p-8">
        <h1 className="text-6xl font-black mb-2 tracking-wider title-glow" style={{
          background: 'linear-gradient(135deg, #00ffff, #ff00ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>0xCIV</h1>
        <p className="text-gray-500 mb-8 text-lg tracking-wide">Your Words Shape Civilizations</p>
        <div className="grid grid-cols-2 gap-4 mb-8">
          {COLORS.map((c, i) => (
            <div key={i} className="px-6 py-3 rounded-lg border text-center" style={{ borderColor: c.color, color: c.color }}>
              {c.name}
            </div>
          ))}
        </div>
        <button
          onClick={startGame}
          className="px-8 py-3 rounded-lg font-bold text-lg bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:from-cyan-400 hover:to-fuchsia-400 transition-all text-white shadow-lg shadow-fuchsia-500/25"
        >
          START GAME
        </button>
        <p className="text-gray-600 text-sm mt-4 flex items-center justify-center gap-2">
          {dataSource === 'loading' && <span className="animate-spin">⏳</span>}
          {dataSource === 'torii' ? '🟢 Connected to Torii (on-chain)' :
           dataSource === 'mock' ? '🟡 Mock mode (Torii unavailable)' :
           'Connecting to Torii...'}
        </p>
        <div className="mt-6 max-w-md text-left bg-gray-900/60 rounded-lg border border-gray-800 p-4">
          <h3 className="text-cyan-400 text-sm font-bold mb-2">🎮 How to Play</h3>
          <ol className="text-gray-400 text-xs space-y-1 list-decimal list-inside">
            <li>Write a <span className="text-cyan-300">strategy prompt</span> to command your AI civilization</li>
            <li>Your AI reads on-chain state and decides: gather, attack, defend, or trade</li>
            <li>Last civilization standing wins — <span className="text-red-400">HP=0, Food=0, or no territories = eliminated</span></li>
            <li>Opponent prompts are <span className="text-fuchsia-300">hidden</span> — information warfare!</li>
          </ol>
          <p className="text-gray-500 text-xs mt-2 italic">Theme: "Stop fighting bots — design around them"</p>
        </div>
        <p className="text-gray-700 text-xs mt-4">Dojo Game Jam VIII</p>
      </div>
    )
  }

  // Game / Ended screen
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-800">
        <h1 className="text-2xl font-black tracking-wider" style={{
          background: 'linear-gradient(135deg, #00ffff, #ff00ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>0xCIV</h1>
        <div className="flex items-center gap-4">
          <span className={`text-xs px-2 py-0.5 rounded ${dataSource === 'torii' ? 'bg-green-900 text-green-400' : 'bg-yellow-900 text-yellow-400'}`}>
            {dataSource === 'torii' ? 'ON-CHAIN' : 'MOCK'}
          </span>
          <span className="text-gray-500 text-sm">Turn {turn}</span>
          <span className="text-gray-600 text-sm">Alive: {civs.filter(c => c.isAlive).length}/{civs.length}</span>
          <button
            onClick={async () => {
              if (walletAddress) {
                await disconnectWallet()
                setWalletAddress(null)
              } else {
                try {
                  const acct = await connectWallet()
                  if (acct?.account) setWalletAddress(acct.account)
                } catch {}
              }
            }}
            className="px-3 py-1 rounded text-xs font-bold border border-fuchsia-500 text-fuchsia-400 hover:bg-fuchsia-500/10 transition-all"
          >
            {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : '🔗 Connect'}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 p-4">
        {/* Left: Map + Prompt */}
        <div className="lg:w-1/2 space-y-4">
          <GridMap grid={grid} civs={civs} selectedCiv={selectedCiv} />

          {/* Civ selector */}
          <div className="flex gap-2">
            {civs.map((c, i) => (
              <button
                key={i}
                onClick={() => { setSelectedCiv(i); setPrompt(c.prompt) }}
                className={`flex-1 py-2 rounded text-xs font-bold border transition-all ${
                  selectedCiv === i ? 'scale-105' : 'opacity-50'
                } ${!c.isAlive ? 'line-through opacity-30' : ''}`}
                style={{ borderColor: c.color, color: c.color }}
              >
                {c.name.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Prompt editor */}
          <div className="bg-gray-900/80 rounded-lg border border-gray-700 p-4">
            <label className="text-gray-400 text-sm block mb-2">Strategy Prompt — Tell your AI how to lead</label>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="e.g. Prioritize food. If attacked, retaliate. Never trade with the weakest..."
              className="w-full h-24 bg-gray-800 rounded border border-gray-600 p-3 text-sm text-gray-200 placeholder-gray-600 focus:border-cyan-500 focus:outline-none resize-none font-mono"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={savePrompt}
                className="px-4 py-2 rounded text-sm font-bold bg-gray-800 border border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 transition-all"
              >
                Save Prompt
              </button>
              <button
                onClick={nextTurn}
                disabled={!!winner}
                className="flex-1 py-2 rounded text-sm font-bold bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:from-cyan-400 hover:to-fuchsia-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {dataSource === 'torii' ? 'SYNC STATE' : 'NEXT TURN'}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Resources + Log */}
        <div className="lg:w-1/2 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {civs.map(c => <ResourcePanel key={c.id} civ={c} />)}
          </div>
          <div>
            <h3 className="text-gray-500 text-sm mb-2 font-bold">TURN LOG</h3>
            <TurnLog logs={logs} />
          </div>
        </div>
      </div>

      {/* Game Over Overlay */}
      {winner && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="text-center p-8 rounded-2xl border-2" style={{ borderColor: winner.color, boxShadow: `0 0 60px ${winner.color}44` }}>
            <p className="text-gray-400 text-sm mb-2">GAME OVER</p>
            <h2 className="text-4xl font-black mb-2" style={{ color: winner.color }}>{winner.name}</h2>
            <p className="text-gray-400 mb-4">Last Civilization Standing — Turn {turn}</p>
            {winner.prompt && (
              <div className="mb-4 mx-auto max-w-sm bg-gray-900/80 rounded-lg p-3 border border-gray-700">
                <p className="text-gray-500 text-xs mb-1">🏆 Winning Strategy:</p>
                <p className="text-cyan-300 text-sm italic">"{winner.prompt}"</p>
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-lg font-bold bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white"
            >
              Play Again
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-950/90 border-t border-gray-800 py-2 px-4 flex justify-between items-center text-xs text-gray-600">
        <span>0xCIV — Dojo Game Jam VIII</span>
        <a href="https://github.com/r0ze998/0xciv" target="_blank" rel="noopener" className="text-cyan-600 hover:text-cyan-400">GitHub</a>
      </div>
    </div>
  )
}
