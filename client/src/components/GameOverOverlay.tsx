import type { Civilization } from '../types/game'

interface Props {
  winner: Civilization
  turn: number
}

export function GameOverOverlay({ winner, turn }: Props) {
  return (
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
  )
}
