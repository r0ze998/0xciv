import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Edges, Html } from '@react-three/drei'
import * as THREE from 'three'
import type { ResourceType } from '../../types/game'

interface Props {
  position: [number, number, number]
  ownerColor: string | null
  resource: ResourceType
  isSelected: boolean
  justCaptured: boolean
  tooltipText: string
}

const HEX_GEO_ARGS: [number, number, number, number] = [1, 1, 0.15, 6]
const HEX_ROTATION: [number, number, number] = [0, Math.PI / 6, 0] // flat-top

export function HexTile({ position, ownerColor, isSelected, justCaptured, tooltipText }: Props) {
  const meshRef = useRef<THREE.Mesh>(null)
  const matRef = useRef<THREE.MeshStandardMaterial>(null)
  const [hovered, setHovered] = useState(false)
  const flashRef = useRef(justCaptured ? 1.0 : 0)

  // Update flash on capture
  if (justCaptured && flashRef.current < 0.5) {
    flashRef.current = 1.0
  }

  useFrame((_, delta) => {
    if (!matRef.current) return
    // Decay capture flash
    if (flashRef.current > 0) {
      flashRef.current = Math.max(0, flashRef.current - delta * 2.5)
    }

    const baseEmissive = ownerColor
      ? isSelected ? 0.3 : 0.15
      : 0
    const flashBoost = flashRef.current * 0.7
    matRef.current.emissiveIntensity = baseEmissive + flashBoost + (hovered ? 0.1 : 0)

    // Scale on hover/select
    if (meshRef.current) {
      const targetScale = isSelected ? 1.05 : hovered ? 1.03 : 1.0
      const targetY = isSelected ? 0.03 : 0
      meshRef.current.scale.x = THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.15)
      meshRef.current.scale.z = THREE.MathUtils.lerp(meshRef.current.scale.z, targetScale, 0.15)
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, position[1] + targetY, 0.15)
    }
  })

  const color = ownerColor || '#12121c'
  const emissiveColor = ownerColor || '#000000'

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={HEX_ROTATION}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <cylinderGeometry args={HEX_GEO_ARGS} />
      <meshStandardMaterial
        ref={matRef}
        color={ownerColor ? `${color}` : '#12121c'}
        emissive={emissiveColor}
        emissiveIntensity={0.15}
        roughness={0.85}
        metalness={0.15}
      />
      <Edges threshold={15} color={ownerColor ? `${ownerColor}66` : '#1a1a2a'} />

      {/* Tooltip on hover */}
      {hovered && (
        <Html
          center
          position={[0, 0.8, 0]}
          zIndexRange={[0, 0]}
          style={{
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            fontSize: 10,
            padding: '2px 8px',
            background: '#0e0e16ee',
            border: '1px solid #2a2a3a',
            color: '#888',
            fontFamily: 'monospace',
            borderRadius: 3,
          }}
        >
          {tooltipText}
        </Html>
      )}
    </mesh>
  )
}
