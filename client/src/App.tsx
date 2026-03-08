import { useState, useEffect } from 'react'
import { connectWallet, disconnectWallet } from './cartridge'
import { sfxTurn, sfxAttack, sfxGather, sfxDefend, sfxTrade, sfxElimination, sfxGameOver } from './sfx'
import { useSound } from './hooks/useSound'
import { useGameState } from './hooks/useGameState'
import { useReplay } from './hooks/useReplay'
import { GridMap, TurnLog, ResourcePanel, LobbyScreen, GameOverOverlay, AutoPlayToggle, TurnBanner, MiniStats, TerritoryChart } from './components'
import { EventToast } from './components/EventToast'
import { TurnTimeline } from './components/TurnTimeline'
import type { TurnSnapshot } from './components/TurnTimeline'
import { PromptHint } from './components/PromptHint'
import { DiplomacyPanel } from './components/DiplomacyPanel'
import { PowerRanking } from './components/PowerRanking'
import { GameClock } from './components/GameClock'
import { QuickTips } from './components/QuickTips'
import { IntroSequence } from './components/IntroSequence'
import { MiniMap } from './components/MiniMap'
import { CivPortrait } from './components/CivPortrait'
import { ActivityFeed } from './components/ActivityFeed'
import { ParticleLayer, useParticles } from './components/Particles'
import { Leaderboard, saveRecord } from './components/Leaderboard'
import { ActionBar } from './components/ActionBar'
import { ReplayControls } from './components/ReplayControls'
import { GameSettings } from './components/GameSettings'
import { PRESET_STRATEGIES } from './lib/constants'
import { getWarCry } from './lib/war-cries'
import { generateCivs } from './lib/game-utils'

export default function App() {
  const game = useGameState()
  const sound = useSound()
  const { particles, emit } = useParticles()
  const replay = useReplay()
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [combatShake, setCombatShake] = useState(false)
  const [history, setHistory] = useState<TurnSnapshot[]>([])
  const [warCry, setWarCry] = useState<{ text: string; color: string } | null>(null)
  const [showIntro, setShowIntro] = useState(false)

  const displayCivs = replay.currentFrame?.civs ?? game.civs
  const displayGrid = replay.currentFrame?.grid ?? game.grid
  const displayTurn = replay.currentFrame?.turn ?? game.turn
  const playerCiv = displayCivs[game.selectedCiv]

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (game.phase !== 'playing' || game.winner) return
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return
      if (e.key === 'n' || e.key === 'N') nextTurn()
      if (e.key >= '1' && e.key <= '4') game.setSelectedCiv(parseInt(e.key) - 1)
      if (e.key === 'a' || e.key === 'A') game.setAutoPlay(p => !p)
      if (e.key === 'm' || e.key === 'M') sound.toggle()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  })

  // Auto-play loop
  useEffect(() => {
    if (!game.autoPlay || game.phase !== 'playing' || game.winner) return
    const interval = setInterval(() => {
      if (game.autoPlayRef.current) nextTurn()
    }, game.autoSpeed)
    return () => clearInterval(interval)
  }, [game.autoPlay, game.autoSpeed, game.phase, game.winner])

  function startGame(names?: string[]) {
    if (names) game.setCivs(prev => prev.map((c, i) => ({ ...c, name: names[i] || c.name })))
    setShowIntro(true)
  }

  function onIntroComplete() {
    setShowIntro(false)
    game.setPhase('playing')
    game.setLogs(prev => [...prev, { turn: 0, message: 'The world awakens. Four civilizations emerge from the void.', type: 'system' }])
  }

  function startSpectate() {
    const presets = PRESET_STRATEGIES.map(([, text]) => text)
    const updated = game.civs.map((c, i) => ({ ...c, prompt: presets[i % presets.length] }))
    game.setCivs(updated)
    game.setPhase('playing')
    game.setAutoPlay(true)
    game.setAutoSpeed(1500)
    game.setLogs(prev => [
      ...prev,
      { turn: 0, message: 'SPECTATOR MODE — All civilizations have been assigned AI strategies.', type: 'system' },
      ...updated.map(c => ({ turn: 0, message: `${c.name}: "${c.prompt.slice(0, 60)}..."`, type: 'system' as const })),
    ])
  }

  function nextTurn() {
    // Record snapshot
    setHistory(prev => [...prev, {
      turn: game.turn,
      civData: game.civs.map(c => ({ id: c.id, hp: c.hp, food: c.food, territories: c.territories, isAlive: c.isAlive })),
    }])

    const result = game.advanceTurn()
    if (!result) return

    // Record replay frame
    replay.record(game.getReplayFrame())

    // SFX + particles
    const cx = window.innerWidth / 2, cy = window.innerHeight / 3
    sound.play(sfxTurn)
    for (const log of result.logs) {
      if (log.type === 'combat') {
        sound.play(sfxAttack)
        emit(cx + (Math.random() - 0.5) * 200, cy + (Math.random() - 0.5) * 100, 'attack')
        setCombatShake(true)
        setTimeout(() => setCombatShake(false), 400)
        // War cry from attacker
        const attackerName = log.message.split(' attacked')[0]
        const attacker = game.civs.find(c => c.name === attackerName)
        if (attacker) setWarCry({ text: getWarCry('combat'), color: attacker.color })
      }
      else if (log.type === 'trade') { sound.play(sfxTrade); emit(cx, cy, 'trade') }
      else if (log.type === 'elimination') { sound.play(sfxElimination); emit(cx, cy, 'elimination') }
      else if (log.type === 'action' && log.message.includes('Gather')) { sound.play(sfxGather); emit(cx + (Math.random() - 0.5) * 200, cy, 'gather') }
      else if (log.type === 'action' && log.message.includes('Defend')) { sound.play(sfxDefend); emit(cx, cy, 'defend') }
    }

    // Game over
    if (game.winner) {
      sound.play(sfxGameOver)
      emit(cx, cy, 'elimination')
      saveRecord({ winner: game.winner.name, winnerColor: game.winner.color, turns: game.turn, strategy: game.winner.prompt.slice(0, 100) })
    }
  }

  function savePrompt() {
    const updated = [...game.civs]
    updated[game.selectedCiv] = { ...updated[game.selectedCiv], prompt: game.prompt }
    game.setCivs(updated)
    game.setLogs(prev => [...prev, { turn: game.turn, message: `${playerCiv.name} updated their strategy prompt`, type: 'system' }])
  }

  if (showIntro) {
    return <IntroSequence civs={game.civs} onComplete={onIntroComplete} />
  }

  if (game.phase === 'lobby') {
    return (
      <div>
        <LobbyScreen dataSource={game.dataSource} onStart={startGame} onSpectate={startSpectate} />
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-10">
          <GameSettings onApply={(s) => {
            game.setSettings(s)
            game.setCivs(generateCivs(s.startingHP, s.startingFood))
          }} />
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gray-950 text-white scanline ${combatShake ? 'animate-combat-shake' : ''}`}>
      <TurnBanner turn={displayTurn} warCry={warCry?.text} warCryColor={warCry?.color} />
      <EventToast logs={game.logs} />
      <ParticleLayer particles={particles} />
      <Leaderboard show={showLeaderboard} onClose={() => setShowLeaderboard(false)} />

      {/* Header */}
      <div className="flex items-center justify-between px-3 sm:px-6 py-2 sm:py-3 border-b border-gray-800">
        <h1 className="text-lg sm:text-2xl font-black tracking-wider shrink-0" style={{
          background: 'linear-gradient(135deg, #00ffff, #ff00ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>0xCIV</h1>
        <div className="flex items-center gap-1.5 sm:gap-3 flex-wrap justify-end">
          <span className="hidden sm:flex"><MiniStats civs={displayCivs} turn={displayTurn} /></span>
          <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded ${game.dataSource === 'torii' ? 'bg-green-900 text-green-400' : 'bg-yellow-900 text-yellow-400'}`}>
            {game.dataSource === 'torii' ? 'ON-CHAIN' : 'MOCK'}
          </span>
          <span className="text-cyan-400 text-xs sm:text-sm font-mono font-bold">T{game.turn}</span>
          <GameClock isPlaying={game.phase === 'playing' && !game.winner} />
          {replay.isReplaying && <span className="text-purple-400 text-[10px] font-bold animate-pulse">REPLAY</span>}
          <button onClick={sound.toggle}
            className="p-1 sm:px-2 sm:py-1 rounded text-xs border border-gray-700 text-gray-400 hover:border-gray-500 transition-all"
            title={sound.muted ? 'Unmute' : 'Mute'}
          >{sound.muted ? '🔇' : '🔊'}</button>
          <button
            onClick={async () => {
              if (game.walletAddress) { await disconnectWallet(); game.setWalletAddress(null) }
              else { try { const acct = await connectWallet(); if (acct?.account) game.setWalletAddress(acct.account) } catch {} }
            }}
            className="px-2 sm:px-3 py-1 rounded text-[10px] sm:text-xs font-bold border border-fuchsia-500 text-fuchsia-400 hover:bg-fuchsia-500/10 transition-all"
          >{game.walletAddress ? `${game.walletAddress.slice(0, 6)}...${game.walletAddress.slice(-4)}` : '🔗'}</button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 p-2 sm:p-4 pb-12">
        {/* Left: Map + Prompt */}
        <div className="lg:w-1/2 space-y-4">
          <QuickTips />
          <GridMap grid={displayGrid} civs={displayCivs} selectedCiv={game.selectedCiv} />

          <div className="flex gap-2">
            {displayCivs.map((c, i) => (
              <CivPortrait
                key={i}
                civ={c}
                isSelected={game.selectedCiv === i}
                onClick={() => { game.setSelectedCiv(i); game.setPrompt(c.prompt) }}
              />
            ))}
          </div>

          <div className="bg-gray-900/80 rounded-lg border border-gray-700 p-4">
            <label className="text-gray-400 text-sm block mb-2">Strategy Prompt — Tell your AI how to lead</label>
            <PromptHint civ={playerCiv} allCivs={displayCivs} />
            <div className="flex gap-1 mb-2 flex-wrap">
              {PRESET_STRATEGIES.map(([label, text]) => (
                <button key={label} onClick={() => game.setPrompt(text)}
                  className="px-2 py-0.5 rounded text-xs bg-gray-800 border border-gray-600 text-gray-400 hover:border-cyan-500 hover:text-cyan-400 transition-all"
                >{label}</button>
              ))}
            </div>
            <textarea
              value={game.prompt}
              onChange={e => game.setPrompt(e.target.value)}
              placeholder="e.g. Prioritize food. If attacked, retaliate. Never trade with the weakest..."
              className="w-full h-24 bg-gray-800 rounded border border-gray-600 p-3 text-sm text-gray-200 placeholder-gray-600 focus:border-cyan-500 focus:outline-none resize-none font-mono"
            />
            <div className="flex gap-2 mt-2 items-center">
              <button onClick={savePrompt}
                className="px-4 py-2 rounded text-sm font-bold bg-gray-800 border border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 transition-all"
              >Save Prompt</button>
              <button onClick={nextTurn} disabled={!!game.winner}
                className="flex-1 py-2 rounded text-sm font-bold bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:from-cyan-400 hover:to-fuchsia-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
              >{game.dataSource === 'torii' ? '🔄 REFRESH' : '⏩ NEXT TURN'}</button>
              <AutoPlayToggle enabled={game.autoPlay} speed={game.autoSpeed}
                onToggle={() => game.setAutoPlay(p => !p)} onSpeedChange={game.setAutoSpeed} />
            </div>
          </div>
        </div>

        {/* Right: Resources + Log */}
        <div className="lg:w-1/2 space-y-4">
          <ActionBar connected={!!game.walletAddress} civs={displayCivs} selectedCiv={game.selectedCiv}
            dataSource={game.dataSource}
            onLog={(msg, type) => game.setLogs(prev => [...prev, { turn: game.turn, message: msg, type }])} />
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {displayCivs.map(c => <ResourcePanel key={c.id} civ={c} />)}
          </div>
          <TerritoryChart grid={displayGrid} civs={displayCivs} />
          <div className="grid grid-cols-2 gap-2">
            <MiniMap grid={displayGrid} civs={displayCivs} />
            <ActivityFeed logs={game.logs} />
          </div>
          <PowerRanking civs={displayCivs} />
          <DiplomacyPanel civs={displayCivs} />
          <TurnTimeline history={history} civs={displayCivs} currentTurn={game.turn} />
          {(game.winner || replay.isReplaying) && (
            <ReplayControls isReplaying={replay.isReplaying} replayIndex={replay.replayIndex}
              totalFrames={replay.totalFrames} onStart={replay.startReplay} onStop={replay.stopReplay}
              onNext={replay.next} onPrev={replay.prev} onSeek={replay.seekTo} />
          )}
          <div>
            <h3 className="text-gray-500 text-sm mb-2 font-bold">TURN LOG</h3>
            <TurnLog logs={game.logs} />
          </div>
        </div>
      </div>

      {game.winner && !replay.isReplaying && (
        <GameOverOverlay winner={game.winner} turn={game.turn} stats={game.gameStats}
          onReplay={replay.totalFrames > 0 ? replay.startReplay : undefined} />
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-gray-950/90 border-t border-gray-800 py-2 px-4 flex justify-between items-center text-xs text-gray-600">
        <span>0xCIV — Dojo Game Jam VIII</span>
        <div className="flex gap-3 items-center">
          <button onClick={() => setShowLeaderboard(true)} className="text-yellow-600 hover:text-yellow-400 transition-all">🏆</button>
          <span className="hidden sm:inline text-gray-700">N: next · 1-4: civ · A: auto · M: mute</span>
          <a href="https://github.com/r0ze998/0xciv" target="_blank" rel="noopener" className="text-cyan-600 hover:text-cyan-400">GitHub</a>
        </div>
      </div>
    </div>
  )
}
