import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchAllOnChainData } from './torii'
import { connectWallet, disconnectWallet } from './cartridge'
import { sfxTurn, sfxAttack, sfxGather, sfxDefend, sfxTrade, sfxElimination, sfxGameOver } from './sfx'
import { useSound } from './hooks/useSound'
import { GridMap, TurnLog, ResourcePanel, LobbyScreen, GameOverOverlay, AutoPlayToggle, TurnBanner, MiniStats, TerritoryChart } from './components'
import { EventToast } from './components/EventToast'
import { TurnTimeline } from './components/TurnTimeline'
import type { TurnSnapshot } from './components/TurnTimeline'
import { PRESET_STRATEGIES } from './lib/constants'
import { onChainCivToUI, onChainTerritoriesToGrid, gamePhaseToUI, generateGrid, generateCivs, assignStartingTerritories, simulateTurn } from './lib/game-utils'
import type { Civilization, Territory, Phase, LogEntry } from './types/game'

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
  const [autoPlay, setAutoPlay] = useState(false)
  const [autoSpeed, setAutoSpeed] = useState(1500)
  const [combatShake, setCombatShake] = useState(false)
  const [history, setHistory] = useState<TurnSnapshot[]>([])
  const sound = useSound()

  const playerCiv = civs[selectedCiv]
  const autoPlayRef = useRef(autoPlay)
  autoPlayRef.current = autoPlay

  // Sync from Torii
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

      const uiCivs = onChainCivs.sort((a, b) => a.civ_id - b.civ_id).map((c, i) => onChainCivToUI(c, i))
      const uiGrid = onChainTerritoriesToGrid(territories)
      const uiPhase = gamePhaseToUI(gameState.game_phase)

      setCivs(prev => uiCivs.map((c, i) => ({ ...c, prompt: prev[i]?.prompt || '' })))
      setGrid(uiGrid)
      setTurn(gameState.turn_number)
      setPhase(uiPhase)

      if (uiPhase === 'ended') {
        const alive = uiCivs.find(c => c.isAlive)
        if (alive) setWinner(alive)
      }

      if (events && events.length > 0) {
        const eventLogs: LogEntry[] = events.map(e => {
          if (e.type === 'action') return { turn: e.turn || 0, message: `Civ #${e.civ_id} performed ${e.action}`, type: 'system' as const }
          if (e.type === 'combat') return { turn: 0, message: `⚔️ Civ #${e.attacker_civ} attacked Civ #${e.defender_civ} — ${e.attacker_won ? 'Victory' : 'Repelled'}! ${e.hp_damage} damage`, type: 'combat' as const }
          if (e.type === 'elimination') return { turn: 0, message: `☠️ Civ #${e.civ_id} has been eliminated!`, type: 'elimination' as const }
          return { turn: 0, message: 'Trade event', type: 'trade' as const }
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

  useEffect(() => {
    syncFromTorii()
    const interval = setInterval(syncFromTorii, 3000)
    return () => clearInterval(interval)
  }, [syncFromTorii])

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (phase !== 'playing' || winner) return
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return
      if (e.key === 'n' || e.key === 'N') nextTurn()
      if (e.key >= '1' && e.key <= '4') setSelectedCiv(parseInt(e.key) - 1)
      if (e.key === 'a' || e.key === 'A') setAutoPlay(p => !p)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  })

  // Auto-play loop
  useEffect(() => {
    if (!autoPlay || phase !== 'playing' || winner) return
    const interval = setInterval(() => {
      if (autoPlayRef.current) nextTurn()
    }, autoSpeed)
    return () => clearInterval(interval)
  }, [autoPlay, autoSpeed, phase, winner])

  function startGame() {
    setPhase('playing')
    setLogs(prev => [...prev, { turn: 0, message: 'The world awakens. Four civilizations emerge from the void.', type: 'system' }])
  }

  function nextTurn() {
    if (winner) return
    if (dataSource === 'torii') {
      syncFromTorii()
      setLogs(prev => [...prev, { turn, message: 'Syncing on-chain state...', type: 'system' }])
      return
    }
    const newTurn = turn + 1
    // Snapshot before turn
    setHistory(prev => [...prev, {
      turn,
      civData: civs.map(c => ({ id: c.id, hp: c.hp, food: c.food, territories: c.territories, isAlive: c.isAlive })),
    }])
    const result = simulateTurn(civs, grid, newTurn)
    setCivs(result.civs)
    setGrid(result.grid)
    setLogs(prev => [...prev, ...result.logs])
    setTurn(newTurn)
    sound.play(sfxTurn)
    for (const log of result.logs) {
      if (log.type === 'combat') {
        sound.play(sfxAttack)
        setCombatShake(true)
        setTimeout(() => setCombatShake(false), 400)
      }
      else if (log.type === 'trade') sound.play(sfxTrade)
      else if (log.type === 'elimination') sound.play(sfxElimination)
      else if (log.type === 'action' && log.message.includes('Gather')) sound.play(sfxGather)
      else if (log.type === 'action' && log.message.includes('Defend')) sound.play(sfxDefend)
    }
    const alive = result.civs.filter(c => c.isAlive)
    if (alive.length <= 1 && result.civs.length > 1) {
      const w = alive[0] || result.civs[0]
      setWinner(w)
      setPhase('ended')
      setAutoPlay(false)
      sound.play(sfxGameOver)
      setLogs(prev => [...prev, { turn: newTurn, message: `${w.name} is the last civilization standing!`, type: 'system' }])
    }
  }

  function savePrompt() {
    const updated = [...civs]
    updated[selectedCiv] = { ...updated[selectedCiv], prompt }
    setCivs(updated)
    setLogs(prev => [...prev, { turn, message: `${playerCiv.name} updated their strategy prompt`, type: 'system' }])
  }

  if (phase === 'lobby') {
    return <LobbyScreen dataSource={dataSource} onStart={startGame} />
  }

  return (
    <div className={`min-h-screen bg-gray-950 text-white scanline ${combatShake ? 'animate-combat-shake' : ''}`}>
      <TurnBanner turn={turn} />
      <EventToast logs={logs} />

      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-gray-800">
        <h1 className="text-xl sm:text-2xl font-black tracking-wider" style={{
          background: 'linear-gradient(135deg, #00ffff, #ff00ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>0xCIV</h1>
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-end">
          <MiniStats civs={civs} turn={turn} />
          <span className={`text-xs px-2 py-0.5 rounded ${dataSource === 'torii' ? 'bg-green-900 text-green-400' : 'bg-yellow-900 text-yellow-400'}`}>
            {dataSource === 'torii' ? 'ON-CHAIN' : 'MOCK'}
          </span>
          <span className="text-cyan-400 text-sm font-mono font-bold">T{turn}</span>
          <button
            onClick={sound.toggle}
            className="px-2 py-1 rounded text-xs border border-gray-700 text-gray-400 hover:border-gray-500 transition-all"
            title={sound.muted ? 'Unmute' : 'Mute'}
          >
            {sound.muted ? '🔇' : '🔊'}
          </button>
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

          <div className="bg-gray-900/80 rounded-lg border border-gray-700 p-4">
            <label className="text-gray-400 text-sm block mb-2">Strategy Prompt — Tell your AI how to lead</label>
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
              <button onClick={savePrompt}
                className="px-4 py-2 rounded text-sm font-bold bg-gray-800 border border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 transition-all"
              >Save Prompt</button>
              <button onClick={nextTurn} disabled={!!winner}
                className="flex-1 py-2 rounded text-sm font-bold bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:from-cyan-400 hover:to-fuchsia-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
              >{dataSource === 'torii' ? '🔄 REFRESH' : '⏩ NEXT TURN'}</button>
              <AutoPlayToggle
                enabled={autoPlay}
                speed={autoSpeed}
                onToggle={() => setAutoPlay(p => !p)}
                onSpeedChange={setAutoSpeed}
              />
            </div>
          </div>
        </div>

        {/* Right: Resources + Log */}
        <div className="lg:w-1/2 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {civs.map(c => <ResourcePanel key={c.id} civ={c} />)}
          </div>
          <TerritoryChart grid={grid} civs={civs} />
          <TurnTimeline history={history} civs={civs} currentTurn={turn} />
          <div>
            <h3 className="text-gray-500 text-sm mb-2 font-bold">TURN LOG</h3>
            <TurnLog logs={logs} />
          </div>
        </div>
      </div>

      {winner && <GameOverOverlay winner={winner} turn={turn} />}

      <div className="fixed bottom-0 left-0 right-0 bg-gray-950/90 border-t border-gray-800 py-2 px-4 flex justify-between items-center text-xs text-gray-600">
        <span>0xCIV — Dojo Game Jam VIII</span>
        <div className="flex gap-4">
          <span className="hidden sm:inline text-gray-700">N: next turn · 1-4: select civ · A: auto-play</span>
          <a href="https://github.com/r0ze998/0xciv" target="_blank" rel="noopener" className="text-cyan-600 hover:text-cyan-400">GitHub</a>
        </div>
      </div>
    </div>
  )
}
