import { useState, useCallback } from 'react'

export function useSound() {
  const [muted, setMuted] = useState(false)

  const toggle = useCallback(() => setMuted(m => !m), [])

  const play = useCallback((fn: () => void) => {
    if (!muted) fn()
  }, [muted])

  return { muted, toggle, play }
}
