import { useState, useCallback } from 'react'
import { sfxTurn, sfxAttack, sfxGather, sfxDefend, sfxTrade, sfxElimination, sfxGameOver } from '../sfx'
import { getWarCry } from '../lib/war-cries'
import { saveRecord } from '../components/Leaderboard'
import type { LogEntry, Civilization } from '../types/game'
import type { useSound } from './useSound'
import type { useParticles } from '../components/Particles'

interface TurnEffectsOptions {
  sound: ReturnType<typeof useSound>
  emit: ReturnType<typeof useParticles>['emit']
}

export function useTurnEffects({ sound, emit }: TurnEffectsOptions) {
  const [combatShake, setCombatShake] = useState(false)
  const [warCry, setWarCry] = useState<{ text: string; color: string } | null>(null)

  const processTurnEffects = useCallback((logs: LogEntry[], civs: Civilization[]) => {
    const cx = window.innerWidth / 2
    const cy = window.innerHeight / 3

    sound.play(sfxTurn)

    for (const log of logs) {
      if (log.type === 'combat') {
        sound.play(sfxAttack)
        emit(cx + (Math.random() - 0.5) * 200, cy + (Math.random() - 0.5) * 100, 'attack')
        setCombatShake(true)
        setTimeout(() => setCombatShake(false), 400)
        const attackerName = log.message.split(' attacked')[0]
        const attacker = civs.find(c => c.name === attackerName)
        if (attacker) setWarCry({ text: getWarCry('combat'), color: attacker.color })
      } else if (log.type === 'trade') {
        sound.play(sfxTrade)
        emit(cx, cy, 'trade')
      } else if (log.type === 'elimination') {
        sound.play(sfxElimination)
        emit(cx, cy, 'elimination')
      } else if (log.type === 'action' && log.message.includes('Gather')) {
        sound.play(sfxGather)
        emit(cx + (Math.random() - 0.5) * 200, cy, 'gather')
      } else if (log.type === 'action' && log.message.includes('Defend')) {
        sound.play(sfxDefend)
        emit(cx, cy, 'defend')
      }
    }
  }, [sound, emit])

  const processGameOver = useCallback((winner: Civilization, turn: number) => {
    const cx = window.innerWidth / 2
    const cy = window.innerHeight / 3
    sound.play(sfxGameOver)
    emit(cx, cy, 'elimination')
    saveRecord({
      winner: winner.name,
      winnerColor: winner.color,
      turns: turn,
      strategy: winner.prompt.slice(0, 100),
    })
  }, [sound, emit])

  return { combatShake, warCry, processTurnEffects, processGameOver }
}
