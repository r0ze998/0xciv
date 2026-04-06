import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'

interface Props {
  turn: number
  combatShake: boolean
}

export function CameraRig({ turn, combatShake }: Props) {
  const { camera } = useThree()
  const prevTurn = useRef(turn)
  const zoomPhase = useRef(0) // 0 = idle, 1 = zooming in, 2 = zooming out
  const shakeTimer = useRef(0)
  const baseY = useRef(camera.position.y)

  useEffect(() => {
    if (turn !== prevTurn.current) {
      prevTurn.current = turn
      zoomPhase.current = 1
    }
  }, [turn])

  useEffect(() => {
    if (combatShake) {
      shakeTimer.current = 0.3
    }
  }, [combatShake])

  useFrame((_, delta) => {
    // Turn change zoom
    if (zoomPhase.current === 1) {
      camera.position.y -= delta * 4
      if (camera.position.y <= baseY.current - 0.8) {
        zoomPhase.current = 2
      }
    } else if (zoomPhase.current === 2) {
      camera.position.y += delta * 3
      if (camera.position.y >= baseY.current) {
        camera.position.y = baseY.current
        zoomPhase.current = 0
      }
    }

    // Combat shake
    if (shakeTimer.current > 0) {
      shakeTimer.current -= delta
      const intensity = shakeTimer.current * 0.15
      camera.position.x += (Math.random() - 0.5) * intensity
      camera.position.z += (Math.random() - 0.5) * intensity
    }
  })

  return null
}
