import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface Props {
  position: [number, number, number]
  color: string
  techLevel: number
}

export function CivBeacon({ position, color, techLevel }: Props) {
  const ref = useRef<THREE.Mesh>(null)
  const height = 0.3 + techLevel * 0.2
  const topRadius = 0.03
  const bottomRadius = 0.06

  const mat = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      uniforms: {
        uColor: { value: new THREE.Color(color) },
        uTime: { value: 0 },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewDir;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          vViewDir = normalize(-mvPos.xyz);
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uTime;
        varying vec3 vNormal;
        varying vec3 vViewDir;
        void main() {
          float fresnel = pow(1.0 - max(0.0, dot(vViewDir, vNormal)), 3.0);
          float pulse = 0.7 + sin(uTime * 3.0) * 0.3;
          gl_FragColor = vec4(uColor * fresnel * pulse, fresnel * 0.6);
        }
      `,
    })
  }, [color])

  useFrame(({ clock }) => {
    mat.uniforms.uTime.value = clock.getElapsedTime()
  })

  return (
    <mesh ref={ref} position={[position[0], position[1] + height / 2, position[2]]}>
      <cylinderGeometry args={[topRadius, bottomRadius, height, 8]} />
      <primitive object={mat} attach="material" />
    </mesh>
  )
}
