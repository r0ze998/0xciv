import { useState, useCallback } from 'react'
import type { Civilization, Territory, LogEntry } from '../types/game'

export interface ReplayFrame {
  turn: number
  civs: Civilization[]
  grid: Territory[][]
  logs: LogEntry[]
}

export function useReplay() {
  const [frames, setFrames] = useState<ReplayFrame[]>([])
  const [replayIndex, setReplayIndex] = useState<number | null>(null)
  const [isReplaying, setIsReplaying] = useState(false)

  const record = useCallback((frame: ReplayFrame) => {
    setFrames(prev => [...prev, frame])
  }, [])

  const startReplay = useCallback(() => {
    if (frames.length === 0) return
    setIsReplaying(true)
    setReplayIndex(0)
  }, [frames])

  const stopReplay = useCallback(() => {
    setIsReplaying(false)
    setReplayIndex(null)
  }, [])

  const seekTo = useCallback((index: number) => {
    if (index >= 0 && index < frames.length) {
      setReplayIndex(index)
    }
  }, [frames.length])

  const next = useCallback(() => {
    setReplayIndex(prev => {
      if (prev === null) return 0
      return Math.min(prev + 1, frames.length - 1)
    })
  }, [frames.length])

  const prev = useCallback(() => {
    setReplayIndex(prev => {
      if (prev === null) return 0
      return Math.max(prev - 1, 0)
    })
  }, [])

  const currentFrame = replayIndex !== null ? frames[replayIndex] : null

  return {
    frames,
    record,
    isReplaying,
    replayIndex,
    currentFrame,
    totalFrames: frames.length,
    startReplay,
    stopReplay,
    seekTo,
    next,
    prev,
  }
}
