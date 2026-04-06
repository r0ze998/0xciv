export function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.15} color="#1a1a2e" />
      <directionalLight position={[5, 10, 5]} intensity={0.4} color="#4466aa" />
      <pointLight position={[0, 3, 0]} intensity={0.3} color="#00ff41" distance={15} decay={2} />
      <pointLight position={[-8, 6, -8]} intensity={0.2} color="#00d4ff" distance={20} decay={2} />
      <fog attach="fog" args={['#0a0a0f', 15, 35]} />
    </>
  )
}
