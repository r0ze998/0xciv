import type { Civilization, GameStats } from '../types/game'
import { ShareCard } from './ShareCard'
import { VICTORY_ICONS, VICTORY_COLORS } from '../lib/victory'
import type { VictoryType } from '../lib/victory'

interface Props {
  winner: Civilization
  turn: number
  stats?: GameStats
  onReplay?: () => void
  victoryType?: VictoryType
}

export function GameOverOverlay({ winner, turn, stats, onReplay, victoryType }: Props) {
  const accentColor = (victoryType && VICTORY_COLORS[victoryType]) || winner.color

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-victory-entrance overflow-y-auto py-8">
      <div className="text-center p-6 sm:p-8 rounded-2xl border-2 animate-fade-up max-w-lg mx-4 w-full" style={{
        borderColor: accentColor,
        boxShadow: `0 0 60px ${accentColor}44, 0 0 120px ${accentColor}22`,
        background: `linear-gradient(135deg, rgba(0,0,0,0.95) 0%, ${accentColor}11 100%)`,
      }}>
        <p className="text-sm mb-2 tracking-widest" style={{ color: `${accentColor}cc` }}>
          {victoryType ? `${VICTORY_ICONS[victoryType] || ''} ${victoryType?.toUpperCase()} VICTORY` : 'GAME OVER'}
        </p>
        <h2 className="text-3xl sm:text-5xl font-black mb-2 title-glow" style={{ color: winner.color }}>{winner.name}</h2>
        <p className="text-gray-400 mb-4">Last Civilization Standing — Turn {turn}</p>

        {/* Winner stats */}
        <div className="flex justify-center gap-4 sm:gap-6 mb-4 text-sm">
          {[
            ['HP', winner.hp],
            ['🍞', winner.food],
            ['⚒️', winner.metal],
            ['📚', winner.knowledge],
            ['🏴', winner.territories],
          ].map(([label, val]) => (
            <div key={String(label)} className="text-center">
              <p className="text-gray-500 text-xs">{label}</p>
              <p style={{ color: winner.color }} className="font-bold">{val}</p>
            </div>
          ))}
        </div>

        {winner.prompt && (
          <div className="mb-4 mx-auto bg-gray-900/80 rounded-lg p-3 border border-gray-700">
            <p className="text-gray-500 text-xs mb-1">🏆 Winning Strategy:</p>
            <p className="text-cyan-300 text-sm italic">"{winner.prompt}"</p>
          </div>
        )}

        {/* Game stats */}
        {stats && (
          <div className="mt-4 space-y-3 text-left">
            <div className="bg-gray-900/60 rounded-lg p-3 border border-gray-800">
              <h4 className="text-gray-500 text-xs font-bold mb-2 tracking-wider">📊 GAME STATS</h4>
              <div className="grid grid-cols-3 gap-2 text-center mb-3">
                <div>
                  <p className="text-lg font-bold text-cyan-400">{stats.totalTurns}</p>
                  <p className="text-[10px] text-gray-500">Turns</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-red-400">{stats.combatEvents}</p>
                  <p className="text-[10px] text-gray-500">Battles</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-blue-400">{stats.tradeEvents}</p>
                  <p className="text-[10px] text-gray-500">Trades</p>
                </div>
              </div>

              {stats.peakHP.hp > 0 && (
                <p className="text-xs text-gray-400">
                  👑 Peak HP: <span style={{ color: stats.peakHP.color }}>{stats.peakHP.name}</span> — {stats.peakHP.hp} HP (T{stats.peakHP.turn})
                </p>
              )}
              {stats.peakTerritories.count > 0 && (
                <p className="text-xs text-gray-400">
                  🗺️ Peak Territory: <span style={{ color: stats.peakTerritories.color }}>{stats.peakTerritories.name}</span> — {stats.peakTerritories.count} tiles (T{stats.peakTerritories.turn})
                </p>
              )}
            </div>

            {stats.eliminationOrder.length > 0 && (
              <div className="bg-gray-900/60 rounded-lg p-3 border border-gray-800">
                <h4 className="text-gray-500 text-xs font-bold mb-2 tracking-wider">☠️ ELIMINATION ORDER</h4>
                <div className="space-y-1">
                  {stats.eliminationOrder.map((e, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: e.color }} />
                        <span style={{ color: e.color }}>{e.name}</span>
                      </span>
                      <span className="text-gray-600">Turn {e.turn}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <ShareCard winner={winner} turn={turn} stats={stats} />

        <div className="flex gap-3 mt-4 justify-center">
          {onReplay && (
            <button
              onClick={onReplay}
              className="px-5 py-3 rounded-lg font-bold border border-purple-500 text-purple-400 hover:bg-purple-500/10 hover:scale-105 active:scale-95 transition-all"
            >
              🔄 Watch Replay
            </button>
          )}
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-lg font-bold bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white hover:scale-105 active:scale-95 transition-all"
          >
            Play Again
          </button>
        </div>
      </div>
    </div>
  )
}
