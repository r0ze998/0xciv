import type { Civilization, GameStats } from '../types/game'
import { ShareCard } from './ShareCard'
import { VICTORY_COLORS } from '../lib/victory'
import type { VictoryType } from '../lib/victory'
import { VICTORY_ICON_MAP } from './Icons'

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
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 animate-victory-entrance overflow-y-auto py-8">
      <div className="text-center p-6 sm:p-8 rounded border-2 animate-fade-up max-w-lg mx-4 w-full corner-deco" style={{
        borderColor: accentColor,
        boxShadow: `0 0 80px ${accentColor}33, 0 0 160px ${accentColor}15, inset 0 0 40px ${accentColor}08`,
        background: `linear-gradient(135deg, var(--c-bg) 0%, ${accentColor}08 100%)`,
      }}>
        <p className="text-[10px] mb-2 tracking-[0.3em] uppercase" style={{
          color: `${accentColor}cc`,
          fontFamily: 'var(--font-display)',
        }}>
          {victoryType && VICTORY_ICON_MAP[victoryType] ? (
            <span className="inline-flex items-center gap-1.5">
              {(() => {
                const vi = VICTORY_ICON_MAP[victoryType]
                const VIcon = vi.component
                return <VIcon size={14} color={vi.color} />
              })()}
              {victoryType.toUpperCase()} VICTORY
            </span>
          ) : 'GAME_OVER'}
        </p>
        <h2 className="text-3xl sm:text-5xl font-black mb-2 title-glow" style={{
          color: winner.color,
          fontFamily: 'var(--font-display)',
          textShadow: `0 0 30px ${winner.color}44`,
        }}>{winner.name}</h2>
        <p className="mb-4 text-xs" style={{ color: 'var(--c-text-dim)' }}>
          Last Civilization Standing — Turn {turn}
        </p>

        {/* Winner stats */}
        <div className="flex justify-center gap-4 sm:gap-6 mb-4 text-sm">
          {[
            ['HP', winner.hp],
            ['FOOD', winner.food],
            ['METAL', winner.metal],
            ['KNOW', winner.knowledge],
            ['TILES', winner.territories],
          ].map(([label, val]) => (
            <div key={String(label)} className="text-center">
              <p className="text-[9px] tracking-wider" style={{ color: 'var(--c-text-muted)', fontFamily: 'var(--font-display)' }}>{label}</p>
              <p style={{ color: winner.color, fontFamily: 'var(--font-mono)' }} className="font-bold">{val}</p>
            </div>
          ))}
        </div>

        {winner.prompt && (
          <div className="mb-4 mx-auto rounded border p-3" style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}>
            <p className="text-[9px] mb-1 tracking-wider" style={{ color: 'var(--c-text-muted)', fontFamily: 'var(--font-display)' }}>WINNING_STRATEGY:</p>
            <p className="text-sm italic neon-cyan">"{winner.prompt}"</p>
          </div>
        )}

        {/* Game stats */}
        {stats && (
          <div className="mt-4 space-y-3 text-left">
            <div className="rounded border p-3" style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}>
              <h4 className="text-[9px] font-bold mb-2 tracking-[0.2em]"
                style={{ color: 'var(--c-text-dim)', fontFamily: 'var(--font-display)' }}>GAME_STATS</h4>
              <div className="grid grid-cols-3 gap-2 text-center mb-3">
                <div>
                  <p className="text-lg font-bold neon-cyan" style={{ fontFamily: 'var(--font-mono)' }}>{stats.totalTurns}</p>
                  <p className="text-[9px]" style={{ color: 'var(--c-text-muted)' }}>Turns</p>
                </div>
                <div>
                  <p className="text-lg font-bold neon-red" style={{ fontFamily: 'var(--font-mono)' }}>{stats.combatEvents}</p>
                  <p className="text-[9px]" style={{ color: 'var(--c-text-muted)' }}>Battles</p>
                </div>
                <div>
                  <p className="text-lg font-bold neon-cyan" style={{ fontFamily: 'var(--font-mono)' }}>{stats.tradeEvents}</p>
                  <p className="text-[9px]" style={{ color: 'var(--c-text-muted)' }}>Trades</p>
                </div>
              </div>

              {stats.peakHP.hp > 0 && (
                <p className="text-xs" style={{ color: 'var(--c-text-dim)' }}>
                  Peak HP: <span style={{ color: stats.peakHP.color }}>{stats.peakHP.name}</span> — {stats.peakHP.hp} HP (T{stats.peakHP.turn})
                </p>
              )}
              {stats.peakTerritories.count > 0 && (
                <p className="text-xs" style={{ color: 'var(--c-text-dim)' }}>
                  Peak Territory: <span style={{ color: stats.peakTerritories.color }}>{stats.peakTerritories.name}</span> — {stats.peakTerritories.count} tiles (T{stats.peakTerritories.turn})
                </p>
              )}
            </div>

            {stats.eliminationOrder.length > 0 && (
              <div className="rounded border p-3" style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}>
                <h4 className="text-[9px] font-bold mb-2 tracking-[0.2em] neon-red"
                  style={{ fontFamily: 'var(--font-display)' }}>ELIMINATION_ORDER</h4>
                <div className="space-y-1">
                  {stats.eliminationOrder.map((e, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: e.color, boxShadow: `0 0 4px ${e.color}` }} />
                        <span style={{ color: e.color }}>{e.name}</span>
                      </span>
                      <span style={{ color: 'var(--c-text-muted)', fontFamily: 'var(--font-mono)' }}>T{e.turn}</span>
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
              className="px-5 py-3 font-bold border transition-all hover:scale-105 active:scale-95 hex-clip text-[10px] tracking-wider"
              style={{
                borderColor: 'var(--c-purple)',
                color: 'var(--c-purple)',
                fontFamily: 'var(--font-display)',
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 15px rgba(191, 0, 255, 0.2)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
            >
              WATCH_REPLAY
            </button>
          )}
          <button
            onClick={() => window.location.reload()}
            className="cyber-btn text-[10px] border-2 transition-all hover:scale-105 active:scale-95"
            style={{
              borderColor: 'var(--c-primary)',
              color: 'var(--c-primary)',
              backgroundColor: 'rgba(0, 255, 65, 0.08)',
              boxShadow: '0 0 20px rgba(0, 255, 65, 0.15)',
              fontFamily: 'var(--font-display)',
            }}
          >
            PLAY_AGAIN
          </button>
        </div>
      </div>
    </div>
  )
}
