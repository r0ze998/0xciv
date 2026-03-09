import { useState, useEffect } from 'react'
import { useSound } from './hooks/useSound'
import { useGameState } from './hooks/useGameState'
import { useReplay } from './hooks/useReplay'
import { useBGM } from './hooks/useBGM'
import { useTurnEffects } from './hooks/useTurnEffects'
import { GridMap } from './components/GridMap'
import { LobbyScreen } from './components/LobbyScreen'
import { GameOverOverlay } from './components/GameOverOverlay'
import { TurnBanner } from './components/TurnBanner'
import { EventToast } from './components/EventToast'
import { QuickTips } from './components/QuickTips'
import { IntroSequence } from './components/IntroSequence'
import { CivPortrait } from './components/CivPortrait'
import { Tutorial } from './components/Tutorial'
import { MobileNav } from './components/MobileNav'
import { ParticleLayer, useParticles } from './components/Particles'
import { Leaderboard } from './components/Leaderboard'
import { GameSettings } from './components/GameSettings'
import { GameHeader } from './components/GameHeader'
import { PromptPanel } from './components/PromptPanel'
import { SidePanel } from './components/SidePanel'
import type { TurnSnapshot } from './components/TurnTimeline'
import { PRESET_STRATEGIES } from './lib/constants'
import { generateCivs } from './lib/game-utils'
import { connectWallet, disconnectWallet } from './cartridge'

export default function App() {
  const game = useGameState()
  const sound = useSound()
  const { particles, emit } = useParticles()
  const replay = useReplay()
  const bgm = useBGM()
  const effects = useTurnEffects({ sound, emit })

  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [history, setHistory] = useState<TurnSnapshot[]>([])
  const [showIntro, setShowIntro] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)

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
    setHistory(prev => [...prev, {
      turn: game.turn,
      civData: game.civs.map(c => ({ id: c.id, hp: c.hp, food: c.food, territories: c.territories, isAlive: c.isAlive })),
    }])

    const result = game.advanceTurn()
    if (!result) return

    replay.record(game.getReplayFrame())
    effects.processTurnEffects(result.logs, game.civs)

    if (game.winner) {
      effects.processGameOver(game.winner, game.turn)
    }
  }

  function savePrompt() {
    const updated = [...game.civs]
    updated[game.selectedCiv] = { ...updated[game.selectedCiv], prompt: game.prompt }
    game.setCivs(updated)
    game.setLogs(prev => [...prev, { turn: game.turn, message: `${playerCiv.name} updated their strategy prompt`, type: 'system' }])
  }

  // --- Render ---

  if (showIntro) {
    return <IntroSequence civs={game.civs} onComplete={() => {
      setShowIntro(false)
      game.setPhase('playing')
      game.setLogs(prev => [...prev, { turn: 0, message: 'The world awakens. Four civilizations emerge from the void.', type: 'system' }])
    }} />
  }

  if (game.phase === 'lobby') {
    return (
      <div>
        <LobbyScreen dataSource={game.dataSource} onStart={startGame} onSpectate={startSpectate} onTutorial={() => setShowTutorial(true)} />
        {showTutorial && <Tutorial onComplete={() => setShowTutorial(false)} />}
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
    <div className={`min-h-screen bg-gray-950 text-white scanline ${effects.combatShake ? 'animate-combat-shake' : ''}`}>
      <TurnBanner turn={displayTurn} warCry={effects.warCry?.text} warCryColor={effects.warCry?.color} />
      <EventToast logs={game.logs} />
      <ParticleLayer particles={particles} />
      <Leaderboard show={showLeaderboard} onClose={() => setShowLeaderboard(false)} />

      <GameHeader
        civs={displayCivs} turn={game.turn} dataSource={game.dataSource}
        isPlaying={game.phase === 'playing'} winner={game.winner}
        isReplaying={replay.isReplaying}
        walletAddress={game.walletAddress} setWalletAddress={game.setWalletAddress}
        bgmPlaying={bgm.playing} onBGMToggle={bgm.toggle}
        soundMuted={sound.muted} onSoundToggle={sound.toggle}
      />

      <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 p-2 sm:p-4 pb-12">
        {/* Left: Map + Prompt */}
        <div className="lg:w-1/2 space-y-4">
          <QuickTips />
          <GridMap grid={displayGrid} civs={displayCivs} selectedCiv={game.selectedCiv} />

          <div className="flex gap-2">
            {displayCivs.map((c, i) => (
              <CivPortrait key={i} civ={c} isSelected={game.selectedCiv === i}
                onClick={() => { game.setSelectedCiv(i); game.setPrompt(c.prompt) }} />
            ))}
          </div>

          <PromptPanel
            prompt={game.prompt} setPrompt={game.setPrompt}
            playerCiv={playerCiv} allCivs={displayCivs}
            onSavePrompt={savePrompt} onNextTurn={nextTurn}
            disabled={!!game.winner} dataSource={game.dataSource}
            autoPlay={game.autoPlay} autoSpeed={game.autoSpeed}
            onAutoToggle={() => game.setAutoPlay(p => !p)} onSpeedChange={game.setAutoSpeed}
          />
        </div>

        <SidePanel
          civs={displayCivs} grid={displayGrid} logs={game.logs}
          turn={game.turn} selectedCiv={game.selectedCiv}
          dataSource={game.dataSource} walletConnected={!!game.walletAddress}
          history={history} winner={game.winner}
          isReplaying={replay.isReplaying} replayIndex={replay.replayIndex}
          totalFrames={replay.totalFrames}
          onStartReplay={replay.startReplay} onStopReplay={replay.stopReplay}
          onNext={replay.next} onPrev={replay.prev} onSeek={replay.seekTo}
          onLog={(msg, type) => game.setLogs(prev => [...prev, { turn: game.turn, message: msg, type }])}
        />
      </div>

      {game.winner && !replay.isReplaying && (
        <GameOverOverlay winner={game.winner} turn={game.turn} stats={game.gameStats}
          victoryType={game.victoryType}
          onReplay={replay.totalFrames > 0 ? replay.startReplay : undefined} />
      )}

      {/* Desktop footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-950/90 border-t border-gray-800 py-2 px-4 hidden sm:flex justify-between items-center text-xs text-gray-600">
        <span>0xCIV — Dojo Game Jam VIII</span>
        <div className="flex gap-3 items-center">
          <button onClick={() => setShowLeaderboard(true)} className="text-yellow-600 hover:text-yellow-400 transition-all">🏆</button>
          <span className="text-gray-700">N: next · 1-4: civ · A: auto · M: mute</span>
          <a href="https://github.com/r0ze998/0xciv" target="_blank" rel="noopener" className="text-cyan-600 hover:text-cyan-400">GitHub</a>
        </div>
      </div>

      {/* Mobile nav */}
      <MobileNav
        civs={displayCivs} selectedCiv={game.selectedCiv}
        onSelectCiv={(i) => { game.setSelectedCiv(i); game.setPrompt(displayCivs[i].prompt) }}
        turn={game.turn} dataSource={game.dataSource}
        walletAddress={game.walletAddress}
        onWalletClick={async () => {
          if (game.walletAddress) { await disconnectWallet(); game.setWalletAddress(null) }
          else { try { const acct = await connectWallet(); if (acct?.account) game.setWalletAddress(acct.account) } catch {} }
        }}
        soundMuted={sound.muted} onSoundToggle={sound.toggle}
        bgmPlaying={bgm.playing} onBGMToggle={bgm.toggle}
        onLeaderboard={() => setShowLeaderboard(true)}
      />
    </div>
  )
}
