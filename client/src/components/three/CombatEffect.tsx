import { useRef, useCallback, useImperativeHandle, forwardRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface Particle {
  position: THREE.Vector3
  velocity: THREE.Vector3
  color: THREE.Color
  life: number
  maxLife: number
}

export interface CombatEffectRef {
  burst: (worldPos: [number, number, number], color: string, count?: number) => void
}

const MAX_PARTICLES = 100

export const CombatEffect = forwardRef<CombatEffectRef>(function CombatEffect(_, ref) {
  const particles = useRef<Particle[]>([])
  const pointsRef = useRef<THREE.Points>(null)
  const positionsRef = useRef(new Float32Array(MAX_PARTICLES * 3))
  const colorsRef = useRef(new Float32Array(MAX_PARTICLES * 3))
  const sizesRef = useRef(new Float32Array(MAX_PARTICLES))

  const burst = useCallback((worldPos: [number, number, number], color: string, count = 12) => {
    const c = new THREE.Color(color)
    for (let i = 0; i < count; i++) {
      if (particles.current.length >= MAX_PARTICLES) break
      const speed = 1.5 + Math.random() * 3
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI * 0.6
      particles.current.push({
        position: new THREE.Vector3(worldPos[0], worldPos[1] + 0.3, worldPos[2]),
        velocity: new THREE.Vector3(
          Math.sin(phi) * Math.cos(theta) * speed,
          Math.cos(phi) * speed * 1.5,
          Math.sin(phi) * Math.sin(theta) * speed,
        ),
        color: c,
        life: 0.8 + Math.random() * 0.4,
        maxLife: 0.8 + Math.random() * 0.4,
      })
    }
  }, [])

  useImperativeHandle(ref, () => ({ burst }), [burst])

  useFrame((_, delta) => {
    const ps = particles.current
    const pos = positionsRef.current
    const cols = colorsRef.current
    const sizes = sizesRef.current

    // Update particles
    for (let i = ps.length - 1; i >= 0; i--) {
      const p = ps[i]
      p.life -= delta
      if (p.life <= 0) {
        ps.splice(i, 1)
        continue
      }
      p.velocity.y -= 4 * delta // gravity
      p.position.addScaledVector(p.velocity, delta)
    }

    // Fill buffers
    for (let i = 0; i < MAX_PARTICLES; i++) {
      if (i < ps.length) {
        const p = ps[i]
        const t = p.life / p.maxLife
        pos[i * 3] = p.position.x
        pos[i * 3 + 1] = p.position.y
        pos[i * 3 + 2] = p.position.z
        cols[i * 3] = p.color.r
        cols[i * 3 + 1] = p.color.g
        cols[i * 3 + 2] = p.color.b
        sizes[i] = t * 0.15
      } else {
        pos[i * 3] = 0
        pos[i * 3 + 1] = -100
        pos[i * 3 + 2] = 0
        sizes[i] = 0
      }
    }

    if (pointsRef.current) {
      const geo = pointsRef.current.geometry
      geo.attributes.position.needsUpdate = true
      geo.attributes.color.needsUpdate = true
      geo.attributes.size.needsUpdate = true
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positionsRef.current, 3]} />
        <bufferAttribute attach="attributes-color" args={[colorsRef.current, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizesRef.current, 1]} />
      </bufferGeometry>
      <pointsMaterial
        vertexColors
        size={0.15}
        transparent
        opacity={0.9}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  )
})
