import { useState } from 'react'

const STEPS = [
  {
    title: 'Welcome to 0xCIV',
    text: 'You command an AI civilization using natural language prompts. Your words shape strategy — gather resources, attack enemies, or forge alliances.',
    emoji: '🌍',
  },
  {
    title: 'Write Your Strategy',
    text: 'Type prompts like "Focus on food and defend if attacked" or "Be aggressive, target the weakest enemy." The AI interprets your intent.',
    emoji: '✍️',
  },
  {
    title: 'Resources & Survival',
    text: '🍞 Food: Consumed each turn. Starvation = death.\n⚒️ Metal: Boosts attack damage.\n📚 Knowledge: Unlocks tech tree bonuses + improves defense.',
    emoji: '📊',
  },
  {
    title: 'Tech Tree',
    text: 'Knowledge unlocks techs: Agriculture (15) → Bronze Working (25) → Writing (40) → Philosophy (60) → Engineering (80) → Enlightenment (100). Each provides unique bonuses.',
    emoji: '🔬',
  },
  {
    title: 'Win Condition',
    text: 'Last civilization standing wins! Civs are eliminated when HP, food, or territories reach 0. Random events (famine, plague, bounty) keep things unpredictable.',
    emoji: '🏆',
  },
  {
    title: 'Pro Tips',
    text: '• Keyboard: N=next turn, A=auto-play, M=mute, 1-4=select civ\n• Territory = more resources when gathering\n• Watch the Power Ranking to identify threats\n• Use Replay after game over to study your strategy',
    emoji: '💡',
  },
]

interface Props {
  onComplete: () => void
}

export function Tutorial({ onComplete }: Props) {
  const [step, setStep] = useState(0)
  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="max-w-md mx-4 w-full text-center animate-fade-up">
        <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6 sm:p-8"
          style={{ boxShadow: '0 0 60px rgba(0, 255, 255, 0.1)' }}>

          {/* Progress dots */}
          <div className="flex gap-1.5 justify-center mb-4">
            {STEPS.map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full transition-all ${
                i === step ? 'bg-cyan-400 scale-125' : i < step ? 'bg-cyan-800' : 'bg-gray-700'
              }`} />
            ))}
          </div>

          <p className="text-4xl mb-3">{current.emoji}</p>
          <h2 className="text-xl font-black mb-3" style={{
            background: 'linear-gradient(135deg, #00ffff, #ff00ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>{current.title}</h2>
          <p className="text-gray-400 text-sm whitespace-pre-line leading-relaxed mb-6">{current.text}</p>

          <div className="flex gap-3 justify-center">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)}
                className="px-4 py-2 rounded-lg text-sm border border-gray-600 text-gray-400 hover:border-gray-400 transition-all">
                ← Back
              </button>
            )}
            <button onClick={() => isLast ? onComplete() : setStep(s => s + 1)}
              className="px-6 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white hover:scale-105 active:scale-95 transition-all">
              {isLast ? 'Start Playing!' : 'Next →'}
            </button>
          </div>

          <button onClick={onComplete}
            className="mt-3 text-[10px] text-gray-600 hover:text-gray-400 transition-all">
            Skip tutorial
          </button>
        </div>
      </div>
    </div>
  )
}
