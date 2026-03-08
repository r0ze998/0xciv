import { useState, useCallback, useEffect, useRef } from 'react'
import { fetchAllOnChainData } from '../torii'
import { onChainCivToUI, onChainTerritoriesToGrid, gamePhaseToUI, generateGrid, generateCivs, assignStartingTerritories, simulateTurn } from '../lib/game-utils'
import type { Civilization, Territory, Phase, LogEntry, GameStats } from '../types/game'
import type { Settings } from '../components/GameSettings'
import { DEFAULT_SETTINGS } from '../components/GameSettings'
import type { ReplayFrame } from './useReplay'
import { checkVictory } from '../lib/victory'
import type { VictoryType } from '../lib/victory'

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

  function advanceTurn(): { logs: LogEntry[] } | null {
    if (winner) return null
    if (dataSource === 'torii') {
      syncFromTorii()
      setLogs(prev => [...prev, { turn, message: 'Syncing on-chain state...', type: 'system' }])
      return null
    }
    const newTurn = turn + 1
    const result = simulateTurn(civs, grid, newTurn, { foodDrain: settings.foodDrain, eventFrequency: settings.eventFrequency })
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

    const victory = checkVictory(result.civs, newTurn)
    if (victory.winner) {
      setWinner(victory.winner)
      setVictoryType(victory.type)
      setPhase('ended')
      setAutoPlay(false)
      setLogs(prev => [...prev, { turn: newTurn, message: victory.message, type: 'system' }])
      return { logs: result.logs }
    }

    return {
      logs: result.logs,
    }
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
