export function HPBar({ hp, maxHp, color }: { hp: number; maxHp: number; color: string }) {
  const pct = (hp / maxHp) * 100
  return (
    <div className="w-full bg-gray-800 rounded-full h-3 border border-gray-700">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, backgroundColor: pct > 50 ? color : pct > 25 ? '#f59e0b' : '#ef4444' }}
      />
    </div>
  )
}
