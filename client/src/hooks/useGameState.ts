import { useState, useCallback, useEffect, useRef } from 'react'
import { fetchAllOnChainData } from '../torii'
import type { VictoryType } from '../torii'
import { onChainCivToUI, onChainTerritoriesToGrid, gamePhaseToUI, generateGrid, generateCivs, assignStartingTerritories, simulateTurn } from '../lib/game-utils'
import type { Civilization, Territory, Phase, LogEntry, GameStats } from '../types/game'
import type { Settings } from '../components/GameSettings'
import { DEFAULT_SETTINGS } from '../components/GameSettings'
import type { ReplayFrame } from './useReplay'
import { executeAdvanceTurn } from '../actions'
import { checkVictory } from '../lib/victory'

export function useGameState() {
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
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [gameStats, setGameStats] = useState<GameStats>({
    totalTurns: 0, combatEvents: 0, tradeEvents: 0, eliminationOrder: [],
    peakHP: { name: '', color: '', hp: 0, turn: 0 },
    peakTerritories: { name: '', color: '', count: 0, turn: 0 },
    totalGathered: {},
  })
  const [victoryType, setVictoryType] = useState<VictoryType>(null)

  const autoPlayRef = useRef(autoPlay)
  autoPlayRef.current = autoPlay

  const syncFromTorii = useCallback(async () => {
    // Don't sync if already in mock mode — let local state drive
    if (dataSource === 'mock') return

    try {
      const { gameState, civs: onChainCivs, territories, events } = await fetchAllOnChainData(1)
      if (!gameState || onChainCivs.length === 0) {
        if (dataSource === 'loading') {
          setDataSource('mock')
          setLogs(prev => [...prev, { turn: 0, message: 'No on-chain game found. Using local simulation.', type: 'system' }])
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

      // Track stats from on-chain state
      setGameStats(prev => {
        const s = { ...prev, totalTurns: gameState.turn_number }
        for (const c of uiCivs) {
          if (c.hp > s.peakHP.hp) s.peakHP = { name: c.name, color: c.color, hp: c.hp, turn: gameState.turn_number }
          if (c.territories > s.peakTerritories.count) s.peakTerritories = { name: c.name, color: c.color, count: c.territories, turn: gameState.turn_number }
        }
        return s
      })

      if (events && events.length > 0) {
        const eventLogs: LogEntry[] = []
        for (const e of events) {
          if (e.type === 'action') {
            eventLogs.push({ turn: e.turn || 0, message: `Civ #${e.civ_id} performed ${e.action}`, type: 'system' })
          } else if (e.type === 'combat') {
            eventLogs.push({ turn: 0, message: `⚔️ Civ #${e.attacker_civ} attacked Civ #${e.defender_civ} — ${e.attacker_won ? 'Victory' : 'Repelled'}! ${e.hp_damage} damage`, type: 'combat' })
            setGameStats(prev => ({ ...prev, combatEvents: prev.combatEvents + 1 }))
          } else if (e.type === 'elimination') {
            eventLogs.push({ turn: 0, message: `☠️ Civ #${e.civ_id} has been eliminated!`, type: 'elimination' })
            const civ = uiCivs.find(c => c.id === (e.civ_id || 0) - 1)
            if (civ) {
              setGameStats(prev => ({
                ...prev,
                eliminationOrder: [...prev.eliminationOrder, { name: civ.name, color: civ.color, turn: gameState.turn_number }],
              }))
            }
          } else if (e.type === 'trade') {
            eventLogs.push({ turn: 0, message: 'Trade executed', type: 'trade' })
            setGameStats(prev => ({ ...prev, tradeEvents: prev.tradeEvents + 1 }))
          } else if (e.type === 'victory') {
            const victorCiv = uiCivs.find(c => c.id === (e.civ_id || 0) - 1)
            if (victorCiv) {
              setWinner(victorCiv)
              setVictoryType(e.victory_type || null)
              const typeLabel = e.victory_type ? e.victory_type.toUpperCase() : 'UNKNOWN'
              eventLogs.push({ turn: gameState.turn_number, message: `🏆 ${typeLabel} VICTORY — ${victorCiv.name} wins!`, type: 'system' })
            }
          } else if (e.type === 'random_event') {
            const eventLabels: Record<string, string> = {
              famine: '🌾 FAMINE',
              bounty: '🎁 BOUNTY',
              plague: '🦠 PLAGUE',
              renaissance: '📖 RENAISSANCE',
            }
            const label = e.event_type ? eventLabels[e.event_type] || e.event_type : 'EVENT'
            const target = e.affected_civ_id && e.affected_civ_id > 0
              ? uiCivs.find(c => c.id === e.affected_civ_id! - 1)?.name || `Civ #${e.affected_civ_id}`
              : 'all civilizations'
            eventLogs.push({ turn: e.turn || 0, message: `${label} affects ${target}! (${e.amount})`, type: 'system' })
          }
        }
        setLogs(eventLogs)
      }

      if (uiPhase === 'ended' && !winner) {
        const alive = uiCivs.find(c => c.isAlive)
        if (alive) {
          setWinner(alive)
          if (!victoryType) setVictoryType('domination')
        }
      }

      if (dataSource !== 'torii') {
        setDataSource('torii')
        setLogs(prev => [...prev, { turn: 0, message: 'Connected to Torii. Showing on-chain data.', type: 'system' }])
      }
    } catch {
      if (dataSource === 'loading') {
        setDataSource('mock')
        setLogs(prev => [...prev, { turn: 0, message: 'Torii unavailable. Connect to a running Torii instance to play.', type: 'system' }])
      }
    }
  }, [dataSource, winner, victoryType])

  useEffect(() => {
    syncFromTorii()
    const interval = setInterval(syncFromTorii, 3000)
    return () => clearInterval(interval)
  }, [syncFromTorii])

  function advanceTurn(): { logs: LogEntry[] } | null {
    if (winner) return null

    if (dataSource === 'torii') {
      // On-chain mode: call contract and sync
      executeAdvanceTurn()
        .then(() => new Promise(resolve => setTimeout(resolve, 500)))
        .then(() => syncFromTorii())
        .catch(() => syncFromTorii())
      return { logs: [] }
    }

    // Mock mode: local simulation
    const newTurn = turn + 1
    const result = simulateTurn(civs, grid, newTurn, {
      foodDrain: settings.foodDrain,
      eventFrequency: settings.eventFrequency,
    })
    setCivs(result.civs)
    setGrid(result.grid)
    setLogs(prev => [...prev, ...result.logs])
    setTurn(newTurn)

    // Track stats
    setGameStats(prev => {
      const s = { ...prev, totalTurns: newTurn }
      for (const log of result.logs) {
        if (log.type === 'combat') s.combatEvents++
        if (log.type === 'trade') s.tradeEvents++
        if (log.type === 'elimination') {
          const name = log.message.match(/(.+?) has been/)?.[1] || 'Unknown'
          const civ = result.civs.find(c => c.name === name)
          s.eliminationOrder = [...s.eliminationOrder, { name, color: civ?.color || '#888', turn: newTurn }]
        }
      }
      for (const c of result.civs) {
        if (c.hp > s.peakHP.hp) s.peakHP = { name: c.name, color: c.color, hp: c.hp, turn: newTurn }
        if (c.territories > s.peakTerritories.count) s.peakTerritories = { name: c.name, color: c.color, count: c.territories, turn: newTurn }
      }
      return s
    })

    // Check victory
    const victory = checkVictory(result.civs, newTurn)
    if (victory.winner) {
      setWinner(victory.winner)
      setVictoryType(victory.type)
      setPhase('ended')
      setAutoPlay(false)
      setLogs(prev => [...prev, { turn: newTurn, message: victory.message, type: 'system' }])
    }

    return { logs: result.logs }
  }

  function getReplayFrame(): ReplayFrame {
    return {
      turn,
      civs: civs.map(c => ({ ...c })),
      grid: grid.map(row => row.map(t => ({ ...t }))),
      logs: [],
    }
  }

  return {
    phase, setPhase,
    grid, setGrid,
    civs, setCivs,
    turn, setTurn,
    logs, setLogs,
    selectedCiv, setSelectedCiv,
    prompt, setPrompt,
    winner, setWinner,
    dataSource,
    walletAddress, setWalletAddress,
    autoPlay, setAutoPlay,
    autoSpeed, setAutoSpeed,
    settings, setSettings,
    gameStats,
    autoPlayRef,
    syncFromTorii,
    victoryType,
    advanceTurn,
    getReplayFrame,
  }
}
