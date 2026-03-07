import type { Civilization } from '../types/game'

interface Props {
  winner: Civilization
  turn: number
}

export function GameOverOverlay({ winner, turn }: Props) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="text-center p-8 rounded-2xl border-2 animate-fade-up max-w-md mx-4" style={{
        borderColor: winner.color,
        boxShadow: `0 0 60px ${winner.color}44, 0 0 120px ${winner.color}22`,
        background: `linear-gradient(135deg, rgba(0,0,0,0.9) 0%, ${winner.color}11 100%)`,
      }}>
        <p className="text-gray-400 text-sm mb-2 tracking-widest">GAME OVER</p>
        <h2 className="text-4xl sm:text-5xl font-black mb-2 title-glow" style={{ color: winner.color }}>{winner.name}</h2>
        <p className="text-gray-400 mb-4">Last Civilization Standing — Turn {turn}</p>

        <div className="flex justify-center gap-6 mb-4 text-sm">
          <div className="text-center">
            <p className="text-gray-500 text-xs">HP</p>
            <p style={{ color: winner.color }} className="font-bold">{winner.hp}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 text-xs">🍞</p>
            <p style={{ color: winner.color }} className="font-bold">{winner.food}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 text-xs">⚒️</p>
            <p style={{ color: winner.color }} className="font-bold">{winner.metal}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 text-xs">📚</p>
            <p style={{ color: winner.color }} className="font-bold">{winner.knowledge}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 text-xs">🏴</p>
            <p style={{ color: winner.color }} className="font-bold">{winner.territories}</p>
          </div>
        </div>

        {winner.prompt && (
          <div className="mb-4 mx-auto bg-gray-900/80 rounded-lg p-3 border border-gray-700">
            <p className="text-gray-500 text-xs mb-1">🏆 Winning Strategy:</p>
            <p className="text-cyan-300 text-sm italic">"{winner.prompt}"</p>
          </div>
        )}
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 rounded-lg font-bold bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white hover:scale-105 active:scale-95 transition-all"
        >
          Play Again
        </button>
      </div>
    </div>
  )
}
