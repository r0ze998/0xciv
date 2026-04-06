import { useRef, useCallback } from 'react'
import type { Civilization, GameStats } from '../types/game'

interface Props {
  winner: Civilization
  turn: number
  stats?: GameStats
}

export function ShareCard({ winner, turn, stats }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const generate = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = 600, h = 315
    canvas.width = w
    canvas.height = h

    // Background
    const bg = ctx.createLinearGradient(0, 0, w, h)
    bg.addColorStop(0, '#030712')
    bg.addColorStop(1, '#0a0a1a')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, w, h)

    // Border glow
    ctx.strokeStyle = winner.color + '66'
    ctx.lineWidth = 2
    ctx.strokeRect(1, 1, w - 2, h - 2)

    // Title
    ctx.font = 'bold 36px monospace'
    const titleGrad = ctx.createLinearGradient(0, 30, 200, 30)
    titleGrad.addColorStop(0, '#00ffff')
    titleGrad.addColorStop(1, '#ff00ff')
    ctx.fillStyle = titleGrad
    ctx.fillText('0xCIV', 30, 50)

    // Subtitle
    ctx.font = '12px monospace'
    ctx.fillStyle = '#6b7280'
    ctx.fillText('GAME OVER — 0xCIV', 30, 70)

    // Winner
    ctx.font = 'bold 24px monospace'
    ctx.fillStyle = winner.color
    ctx.fillText(`👑 ${winner.name}`, 30, 120)

    ctx.font = '14px monospace'
    ctx.fillStyle = '#9ca3af'
    ctx.fillText(`Last Civilization Standing — Turn ${turn}`, 30, 145)

    // Stats
    if (stats) {
      const y = 180
      ctx.font = '13px monospace'

      ctx.fillStyle = '#00ffff'
      ctx.fillText(`${stats.totalTurns}`, 50, y)
      ctx.fillStyle = '#6b7280'
      ctx.fillText('Turns', 50, y + 16)

      ctx.fillStyle = '#ef4444'
      ctx.fillText(`${stats.combatEvents}`, 150, y)
      ctx.fillStyle = '#6b7280'
      ctx.fillText('Battles', 150, y + 16)

      ctx.fillStyle = '#3b82f6'
      ctx.fillText(`${stats.tradeEvents}`, 250, y)
      ctx.fillStyle = '#6b7280'
      ctx.fillText('Trades', 250, y + 16)

      // Elimination order
      if (stats.eliminationOrder.length > 0) {
        ctx.font = '11px monospace'
        ctx.fillStyle = '#4b5563'
        ctx.fillText('Eliminated:', 350, y)
        stats.eliminationOrder.forEach((e, i) => {
          ctx.fillStyle = e.color
          ctx.fillText(`☠ ${e.name} (T${e.turn})`, 350, y + 16 + i * 14)
        })
      }
    }

    // Winner stats
    const sy = 240
    ctx.font = '12px monospace'
    const statItems = [
      [`❤️ ${winner.hp}`, winner.color],
      [`🍞 ${winner.food}`, '#facc15'],
      [`⚒️ ${winner.metal}`, '#9ca3af'],
      [`📚 ${winner.knowledge}`, '#3b82f6'],
      [`🏴 ${winner.territories}`, '#4ade80'],
    ]
    statItems.forEach(([text, color], i) => {
      ctx.fillStyle = color
      ctx.fillText(text, 30 + i * 110, sy)
    })

    // Winning strategy
    if (winner.prompt) {
      ctx.font = '11px monospace'
      ctx.fillStyle = '#00ffff88'
      const truncated = winner.prompt.length > 60 ? winner.prompt.slice(0, 57) + '...' : winner.prompt
      ctx.fillText(`"${truncated}"`, 30, 280)
    }

    // Footer
    ctx.font = '10px monospace'
    ctx.fillStyle = '#374151'
    ctx.fillText('r0ze998.github.io/0xciv', 30, 305)
    ctx.fillText('Starknet × Dojo × AI', 430, 305)
  }, [winner, turn, stats])

  const download = () => {
    generate()
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `0xciv-${winner.name.replace(/\s/g, '-')}-T${turn}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const share = async () => {
    generate()
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.toBlob(async (blob) => {
      if (!blob) return
      const text = `👑 ${winner.name} wins in Turn ${turn}!\n\n🎮 0xCIV — AI Civilization Strategy on Starknet\n🔗 https://r0ze998.github.io/0xciv/\n\n#0xCIV #Starknet #AI`

      if (navigator.share) {
        try {
          await navigator.share({
            text,
            files: [new File([blob], '0xciv-result.png', { type: 'image/png' })],
          })
          return
        } catch {}
      }
      // Fallback: copy text
      await navigator.clipboard.writeText(text)
      alert('Share text copied! Download the image below.')
      download()
    }, 'image/png')
  }

  return (
    <div className="mt-3 flex gap-2 justify-center">
      <canvas ref={canvasRef} className="hidden" />
      <button
        onClick={share}
        className="px-3 py-1.5 rounded text-xs font-bold border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 transition-all"
      >
        📤 Share
      </button>
      <button
        onClick={download}
        className="px-3 py-1.5 rounded text-xs font-bold border border-gray-600 text-gray-400 hover:border-gray-500 transition-all"
      >
        📥 Download
      </button>
    </div>
  )
}
