import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { ResourceType } from '../../types/game'

interface Props {
  position: [number, number, number]
  resource: ResourceType
  seed: number
}

const RESOURCE_CONFIG: Record<ResourceType, { color: string; emissive: string }> = {
  food: { color: '#2d8a4e', emissive: '#4ade80' },
  metal: { color: '#4a5568', emissive: '#60a5fa' },
  knowledge: { color: '#5b21b6', emissive: '#c084fc' },
}

export function ResourceMarker({ position, resource, seed }: Props) {
  const ref = useRef<THREE.Mesh>(null)
  const cfg = RESOURCE_CONFIG[resource]

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime()
    ref.current.position.y = position[1] + Math.sin(t * 2 + seed) * 0.05
    ref.current.rotation.y = t * 0.5 + seed
  })

  return (
    <mesh ref={ref} position={position} scale={0.12}>
      {resource === 'food' && <octahedronGeometry args={[1, 0]} />}
      {resource === 'metal' && <boxGeometry args={[1, 1, 1]} />}
      {resource === 'knowledge' && <tetrahedronGeometry args={[1, 0]} />}
      <meshStandardMaterial
        color={cfg.color}
        emissive={cfg.emissive}
        emissiveIntensity={0.5}
        roughness={0.3}
        metalness={0.5}
      />
    </mesh>
  )
}
