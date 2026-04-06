import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { Territory, Civilization } from '../../types/game'
import { SceneLighting } from './SceneLighting'
import { HexBoard } from './HexBoard'
import { CameraRig } from './CameraRig'

interface Props {
  grid: Territory[][]
  civs: Civilization[]
  selectedCiv: number
  turn: number
  combatShake: boolean
}

export function GameScene({ grid, civs, selectedCiv, turn, combatShake }: Props) {
  return (
    <div style={{ width: '100%', aspectRatio: '4 / 3', borderRadius: 8, overflow: 'hidden', border: '1px solid #1a1a2a' }}>
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 12, 10], fov: 45, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => {
          gl.setClearColor('#0a0a0f')
        }}
      >
        <SceneLighting />
        <HexBoard grid={grid} civs={civs} selectedCiv={selectedCiv} />
        <CameraRig turn={turn} combatShake={combatShake} />
        <OrbitControls
          enablePan={false}
          minPolarAngle={0.3}
          maxPolarAngle={1.3}
          minDistance={8}
          maxDistance={25}
          enableDamping
          dampingFactor={0.05}
        />
        {/* Ground plane for depth reference */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]} receiveShadow>
          <planeGeometry args={[30, 30]} />
          <meshStandardMaterial color="#050508" roughness={1} metalness={0} />
        </mesh>
      </Canvas>
    </div>
  )
}
