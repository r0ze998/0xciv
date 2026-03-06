// Minimal Web Audio API sound effects — no external files needed
const ctx = () => {
  if (!_ctx) _ctx = new AudioContext()
  return _ctx
}
let _ctx: AudioContext | null = null

function beep(freq: number, duration: number, type: OscillatorType = 'square', vol = 0.08) {
  const c = ctx()
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = type
  osc.frequency.value = freq
  gain.gain.setValueAtTime(vol, c.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration)
  osc.connect(gain)
  gain.connect(c.destination)
  osc.start()
  osc.stop(c.currentTime + duration)
}

export function sfxGather() {
  beep(440, 0.1, 'sine', 0.06)
  setTimeout(() => beep(660, 0.15, 'sine', 0.06), 80)
}

export function sfxAttack() {
  beep(120, 0.15, 'sawtooth', 0.08)
  setTimeout(() => beep(80, 0.2, 'sawtooth', 0.06), 100)
}

export function sfxDefend() {
  beep(330, 0.12, 'triangle', 0.06)
  setTimeout(() => beep(440, 0.12, 'triangle', 0.06), 100)
}

export function sfxTrade() {
  beep(523, 0.08, 'sine', 0.05)
  setTimeout(() => beep(659, 0.08, 'sine', 0.05), 70)
  setTimeout(() => beep(784, 0.12, 'sine', 0.05), 140)
}

export function sfxElimination() {
  beep(200, 0.3, 'sawtooth', 0.1)
  setTimeout(() => beep(100, 0.5, 'sawtooth', 0.08), 200)
}

export function sfxTurn() {
  beep(880, 0.06, 'square', 0.04)
}

export function sfxGameOver() {
  const notes = [523, 659, 784, 1047]
  notes.forEach((f, i) => setTimeout(() => beep(f, 0.2, 'sine', 0.06), i * 120))
}
