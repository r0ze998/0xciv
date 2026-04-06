import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface Props {
  position: [number, number, number]
  color: string
  isSelected: boolean
}

export function TerritoryGlow({ position, color, isSelected }: Props) {
  const mat = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      uniforms: {
        uColor: { value: new THREE.Color(color) },
        uIntensity: { value: isSelected ? 0.4 : 0.2 },
        uTime: { value: 0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uIntensity;
        uniform float uTime;
        varying vec2 vUv;
        void main() {
          float dist = length(vUv - 0.5) * 2.0;
          float glow = smoothstep(1.0, 0.2, dist);
          float pulse = 0.85 + sin(uTime * 2.5) * 0.15;
          float alpha = glow * uIntensity * pulse;
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
    })
  }, [color, isSelected])

  useFrame(({ clock }) => {
    mat.uniforms.uTime.value = clock.getElapsedTime()
    mat.uniforms.uIntensity.value = isSelected ? 0.4 : 0.2
  })

  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[1.1, 6]} />
      <primitive object={mat} attach="material" />
    </mesh>
  )
}
