import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { Territory, Civilization } from '../../types/game'
import { SceneLighting } from './SceneLighting'
import { HexBoard } from './HexBoard'
import { CameraRig } from './CameraRig'
import { Starfield } from './Starfield'
import { CombatEffect } from './CombatEffect'

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
        camera={{ position: [0, 11, 9], fov: 50, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => {
          gl.setClearColor('#050508')
        }}
      >
        <SceneLighting />
        <Starfield count={200} />
        <HexBoard grid={grid} civs={civs} selectedCiv={selectedCiv} />
        <CombatEffect />
        <CameraRig turn={turn} combatShake={combatShake} />
        <OrbitControls
          enablePan={false}
          minPolarAngle={0.3}
          maxPolarAngle={1.3}
          minDistance={6}
          maxDistance={22}
          enableDamping
          dampingFactor={0.05}
        />
        {/* Ground plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
          <planeGeometry args={[40, 40]} />
          <meshStandardMaterial color="#030306" roughness={1} metalness={0} />
        </mesh>
      </Canvas>
    </div>
  )
}
