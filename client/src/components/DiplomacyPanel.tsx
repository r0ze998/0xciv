import type { Civilization } from '../types/game'

interface Props {
  civs: Civilization[]
}

function getThreatLevel(attacker: Civilization, defender: Civilization): 'low' | 'med' | 'high' {
  if (!attacker.isAlive || !defender.isAlive) return 'low'
  const prompt = attacker.prompt.toLowerCase()
  
  // Check if prompt mentions attacking
  if (prompt.includes('attack') || prompt.includes('aggro')) {
    // Targeting weakest?
    if (prompt.includes('weakest') || prompt.includes('weak')) {
      const isWeakest = defender.hp <= attacker.hp * 0.7
      return isWeakest ? 'high' : 'med'
    }
    return 'med'
  }
  if (prompt.includes('defend') || prompt.includes('turtle') || prompt.includes('never attack')) return 'low'
  
  // Default: based on resources
  if (attacker.metal > 40 && defender.hp < 40) return 'high'
  if (attacker.metal > 20) return 'med'
  return 'low'
}

const THREAT_STYLE = {
  low: { color: 'text-green-800', bg: 'bg-green-900/20', label: '·' },
  med: { color: 'text-yellow-600', bg: 'bg-yellow-900/20', label: '⚠' },
  high: { color: 'text-red-500', bg: 'bg-red-900/30', label: '⚔' },
}

export function DiplomacyPanel({ civs }: Props) {
  const alive = civs.filter(c => c.isAlive)
  if (alive.length < 2) return null

  return (
    <div className="bg-gray-900/80 rounded-lg border border-gray-700 p-3">
      <h3 className="text-gray-500 text-xs font-bold mb-2 tracking-wider">🕊️ THREAT MATRIX</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-[10px]">
          <thead>
            <tr>
              <th className="text-left text-gray-600 pb-1">→ targets</th>
              {alive.map(c => (
                <th key={c.id} className="text-center pb-1 px-1" style={{ color: c.color }}>
                  {c.name.split(' ')[0]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {alive.map(attacker => (
              <tr key={attacker.id}>
                <td className="pr-2 py-0.5" style={{ color: attacker.color }}>{attacker.name.split(' ')[0]}</td>
                {alive.map(defender => {
                  if (attacker.id === defender.id) return <td key={defender.id} className="text-center text-gray-800">—</td>
                  const threat = getThreatLevel(attacker, defender)
                  const style = THREAT_STYLE[threat]
                  return (
                    <td key={defender.id} className={`text-center ${style.color} ${style.bg} rounded`}>
                      {style.label}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-3 mt-1.5 text-[9px] text-gray-600">
        <span>· Safe</span>
        <span className="text-yellow-700">⚠ Caution</span>
        <span className="text-red-600">⚔ Danger</span>
      </div>
    </div>
  )
}
