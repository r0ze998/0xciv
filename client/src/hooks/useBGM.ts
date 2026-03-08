import { useRef, useCallback, useState } from 'react'

// Procedural chiptune BGM using Web Audio API
export function useBGM() {
  const ctxRef = useRef<AudioContext | null>(null)
  const gainRef = useRef<GainNode | null>(null)
  const intervalRef = useRef<number | null>(null)
  const [playing, setPlaying] = useState(false)

  const NOTES = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25] // C4-C5
  const BASS = [130.81, 146.83, 164.81, 174.61] // C3-F3
  // Major scale intervals available for future melody generation
  // const SCALE = [0, 2, 4, 5, 7, 9, 11]

  function playNote(ctx: AudioContext, gain: GainNode, freq: number, time: number, dur: number, type: OscillatorType = 'square', vol = 0.06) {
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, time)
    g.gain.setValueAtTime(vol, time)
    g.gain.exponentialRampToValueAtTime(0.001, time + dur)
    osc.connect(g).connect(gain)
    osc.start(time)
    osc.stop(time + dur)
  }

  function generateBar(ctx: AudioContext, gain: GainNode, startTime: number) {
    const bpm = 90
    const beatDur = 60 / bpm
    const barLen = beatDur * 4

    // Melody: gentle arpeggiated pattern
    for (let i = 0; i < 8; i++) {
      const noteIdx = Math.floor(Math.random() * NOTES.length)
      const time = startTime + i * (barLen / 8)
      if (Math.random() > 0.3) { // 70% chance to play
        playNote(ctx, gain, NOTES[noteIdx], time, beatDur * 0.8, 'triangle', 0.04)
      }
    }

    // Bass: root notes
    for (let i = 0; i < 2; i++) {
      const bassIdx = Math.floor(Math.random() * BASS.length)
      playNote(ctx, gain, BASS[bassIdx], startTime + i * beatDur * 2, beatDur * 1.8, 'sine', 0.05)
    }

    // Pad: sustained chord
    const root = NOTES[Math.floor(Math.random() * 4)]
    playNote(ctx, gain, root, startTime, barLen * 0.9, 'sine', 0.025)
    playNote(ctx, gain, root * 1.25, startTime, barLen * 0.9, 'sine', 0.02) // major third
    playNote(ctx, gain, root * 1.5, startTime, barLen * 0.9, 'sine', 0.015) // fifth

    return barLen
  }

  const start = useCallback(() => {
    if (playing) return
    const ctx = new AudioContext()
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.5, ctx.currentTime)
    gain.connect(ctx.destination)
    ctxRef.current = ctx
    gainRef.current = gain

    let nextBar = ctx.currentTime + 0.1

    function scheduleNext() {
      if (!ctxRef.current) return
      const barLen = generateBar(ctx, gain, nextBar)
      nextBar += barLen
    }

    // Schedule first bars
    scheduleNext()
    scheduleNext()

    // Keep scheduling
    intervalRef.current = window.setInterval(() => {
      if (ctxRef.current && nextBar - ctxRef.current.currentTime < 4) {
        scheduleNext()
      }
    }, 1000)

    setPlaying(true)
  }, [playing])

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (gainRef.current) {
      gainRef.current.gain.exponentialRampToValueAtTime(0.001, (ctxRef.current?.currentTime || 0) + 0.5)
    }
    setTimeout(() => {
      ctxRef.current?.close()
      ctxRef.current = null
      gainRef.current = null
    }, 600)
    setPlaying(false)
  }, [])

  const toggle = useCallback(() => {
    if (playing) stop()
    else start()
  }, [playing, start, stop])

  return { playing, start, stop, toggle }
}
