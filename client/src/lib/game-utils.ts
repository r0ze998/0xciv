import type { Civilization, Territory, ResourceType, Phase, LogEntry } from '../types/game'
import type { OnChainCivilization, OnChainTerritory } from '../torii'
import { COLORS, GRID_SIZE, RESOURCE_MAP, RESOURCE_ICONS } from './constants'

export function onChainCivToUI(civ: OnChainCivilization, index: number): Civilization {
  const colorInfo = COLORS[index] || COLORS[0]
  return {
    id: index,
    name: colorInfo.name,
    color: colorInfo.color,
    neonClass: colorInfo.neonClass,
    hp: civ.hp,
    maxHp: 100,
    food: civ.food,
    metal: civ.metal,
    knowledge: civ.knowledge,
    territories: civ.territory_count,
    isAlive: civ.is_alive,
    prompt: '',
  }
}

export function parseResourceType(rt: string | number): ResourceType {
  if (typeof rt === 'string') {
    const lower = rt.toLowerCase()
    if (lower === 'metal') return 'metal'
    if (lower === 'knowledge') return 'knowledge'
    return 'food'
  }
  return RESOURCE_MAP[rt] || 'food'
}

export function onChainTerritoriesToGrid(territories: OnChainTerritory[]): Territory[][] {
  const grid: Territory[][] = Array.from({ length: GRID_SIZE }, (_, y) =>
    Array.from({ length: GRID_SIZE }, (_, x) => ({
      x, y, owner: null, resource: 'food' as ResourceType,
    }))
  )
  for (const t of territories) {
    if (t.x < GRID_SIZE && t.y < GRID_SIZE) {
      grid[t.y][t.x] = {
        x: t.x,
        y: t.y,
        owner: t.owner_civ_id > 0 ? t.owner_civ_id - 1 : null,
        resource: parseResourceType(t.resource_type),
      }
    }
  }
  return grid
}

export function gamePhaseToUI(phase: number | string): Phase {
  if (phase === 0 || phase === 'Setup') return 'lobby'
  if (phase === 2 || phase === 'Ended') return 'ended'
  return 'playing'
}

export function generateGrid(): Territory[][] {
  const resources: ResourceType[] = ['food', 'metal', 'knowledge']
  return Array.from({ length: GRID_SIZE }, (_, y) =>
    Array.from({ length: GRID_SIZE }, (_, x) => ({
      x, y, owner: null,
      resource: resources[Math.floor(Math.random() * 3)],
    }))
  )
}

export function generateCivs(): Civilization[] {
  return COLORS.map((c, i) => ({
    id: i,
    name: c.name,
    color: c.color,
    neonClass: c.neonClass,
    hp: 100, maxHp: 100,
    food: 50, metal: 30, knowledge: 10,
    territories: 1, isAlive: true, prompt: '',
  }))
}

export function assignStartingTerritories(grid: Territory[][]): Territory[][] {
  const corners = [[0, 0], [4, 0], [0, 4], [4, 4]]
  const newGrid = grid.map(row => row.map(t => ({ ...t })))
  corners.forEach(([x, y], i) => { newGrid[y][x].owner = i })
  return newGrid
}

function chooseAction(civ: Civilization, civs: Civilization[]): string {
  const prompt = civ.prompt.toLowerCase()
  const alive = civs.filter(c => c.isAlive && c.id !== civ.id)

  // Prompt-based strategy hints
  if (prompt) {
    if (prompt.includes('aggro') || prompt.includes('attack')) {
      return Math.random() > 0.2 ? 'attack' : 'gather'
    }
    if (prompt.includes('turtle') || prompt.includes('defend')) {
      return Math.random() > 0.3 ? 'defend' : 'gather'
    }
    if (prompt.includes('econ') || prompt.includes('gather') || prompt.includes('resource')) {
      return Math.random() > 0.2 ? 'gather' : 'trade'
    }
    if (prompt.includes('chaos') || prompt.includes('random')) {
      return ['gather', 'attack', 'defend', 'trade'][Math.floor(Math.random() * 4)]
    }
  }

  // Smart defaults based on state
  if (civ.hp < 30) return Math.random() > 0.3 ? 'defend' : 'gather'
  if (civ.food < 15) return 'gather'
  if (civ.territories >= 8 && alive.length > 1) return Math.random() > 0.5 ? 'defend' : 'attack'
  if (civ.metal > 60 && alive.length > 1) return 'attack'

  return ['gather', 'attack', 'defend', 'trade'][Math.floor(Math.random() * 4)]
}

export function simulateTurn(
  civs: Civilization[],
  grid: Territory[][],
  turn: number
): { civs: Civilization[]; grid: Territory[][]; logs: LogEntry[] } {
  const newCivs = civs.map(c => ({ ...c }))
  const newGrid = grid.map(row => row.map(t => ({ ...t })))
  const logs: LogEntry[] = []
  const alive = newCivs.filter(c => c.isAlive)

  alive.forEach(civ => {
    const action = chooseAction(civ, newCivs)
    const c = newCivs[civ.id]

    if (action === 'gather') {
      // Gathering scales with territory count
      const territoryBonus = Math.max(1, c.territories)
      const bonus = Math.floor(Math.random() * 10 * Math.min(territoryBonus, 3)) + 5
      // Gather resource based on owned territory types
      const ownedTiles = newGrid.flat().filter(t => t.owner === civ.id)
      const res = ownedTiles.length > 0
        ? ownedTiles[Math.floor(Math.random() * ownedTiles.length)].resource
        : (['food', 'metal', 'knowledge'] as ResourceType[])[Math.floor(Math.random() * 3)]
      c[res] += bonus
      logs.push({ turn, message: `${c.name} gathered +${bonus} ${RESOURCE_ICONS[res]} ${res}`, type: 'action' })
    } else if (action === 'attack') {
      const targets = alive.filter(t => t.id !== civ.id)
      if (targets.length > 0) {
        // Smart targeting based on prompt
        const prompt = c.prompt.toLowerCase()
        let target: Civilization
        if (prompt.includes('weakest') || prompt.includes('weak')) {
          target = [...targets].sort((a, b) => a.hp - b.hp)[0]
        } else if (prompt.includes('strongest') || prompt.includes('leader')) {
          target = [...targets].sort((a, b) => b.territories - a.territories)[0]
        } else {
          target = targets[Math.floor(Math.random() * targets.length)]
        }
        const t = newCivs[target.id]
        // Damage scales with attacker's metal, reduced by defender's knowledge
        const baseDmg = Math.floor(Math.random() * 15) + 5
        const metalBonus = Math.min(Math.floor(c.metal / 20), 10)
        const knowledgeDefense = Math.min(Math.floor(t.knowledge / 15), 8)
        const dmg = Math.max(3, baseDmg + metalBonus - knowledgeDefense)
        t.hp = Math.max(0, t.hp - dmg)
        c.metal = Math.max(0, c.metal - 5)
        const critical = dmg >= 20
        logs.push({ turn, message: `${c.name} attacked ${t.name} for ${dmg} damage!${critical ? ' 💥 CRITICAL HIT!' : ''}`, type: 'combat' })
        if (Math.random() > 0.6) {
          const targetTerritories = newGrid.flat().filter(tt => tt.owner === target.id)
          if (targetTerritories.length > 0) {
            const captured = targetTerritories[Math.floor(Math.random() * targetTerritories.length)]
            newGrid[captured.y][captured.x].owner = civ.id
            c.territories++
            t.territories = Math.max(0, t.territories - 1)
            logs.push({ turn, message: `${c.name} captured territory (${captured.x},${captured.y}) from ${t.name}!`, type: 'combat' })
          }
        }
      }
    } else if (action === 'defend') {
      const healAmount = 5 + Math.min(Math.floor(c.knowledge / 10), 5)
      c.hp = Math.min(c.maxHp, c.hp + healAmount)
      logs.push({ turn, message: `${c.name} fortified defenses (+${healAmount} HP)`, type: 'action' })
    } else {
      // Trading: better rates with more knowledge
      const knowledgeBonus = Math.min(Math.floor(c.knowledge / 20), 5)
      const foodGain = 8 + knowledgeBonus
      const knowledgeGain = 3 + Math.floor(knowledgeBonus / 2)
      c.food += foodGain
      c.knowledge += knowledgeGain
      logs.push({ turn, message: `${c.name} traded resources (+${foodGain} food, +${knowledgeGain} knowledge)`, type: 'trade' })
    }
    c.food = Math.max(0, c.food - 3)
  })

  // Random events every 5 turns
  if (turn % 5 === 0 && turn > 0) {
    const eventRoll = Math.random()
    const aliveNow = newCivs.filter(c => c.isAlive)
    if (eventRoll < 0.25 && aliveNow.length > 0) {
      // Famine — all civs lose food
      const loss = Math.floor(Math.random() * 10) + 5
      aliveNow.forEach(c => { c.food = Math.max(0, c.food - loss) })
      logs.push({ turn, message: `🌾 FAMINE strikes! All civilizations lose ${loss} food.`, type: 'system' })
    } else if (eventRoll < 0.5 && aliveNow.length > 0) {
      // Bounty — random civ gets bonus
      const lucky = aliveNow[Math.floor(Math.random() * aliveNow.length)]
      const bonus = Math.floor(Math.random() * 15) + 10
      lucky.food += bonus
      lucky.metal += Math.floor(bonus / 2)
      logs.push({ turn, message: `🎁 BOUNTY! ${lucky.name} discovers ancient resources (+${bonus} food, +${Math.floor(bonus / 2)} metal)`, type: 'system' })
    } else if (eventRoll < 0.7) {
      // Plague — random civ loses HP
      const unlucky = aliveNow[Math.floor(Math.random() * aliveNow.length)]
      const dmg = Math.floor(Math.random() * 15) + 5
      unlucky.hp = Math.max(1, unlucky.hp - dmg)
      logs.push({ turn, message: `🦠 PLAGUE hits ${unlucky.name}! -${dmg} HP`, type: 'system' })
    } else if (eventRoll < 0.85) {
      // Knowledge boom — all gain knowledge
      const gain = Math.floor(Math.random() * 8) + 3
      aliveNow.forEach(c => { c.knowledge += gain })
      logs.push({ turn, message: `📖 RENAISSANCE! All civilizations gain +${gain} knowledge.`, type: 'system' })
    }
    // 15% chance of no event
  }

  newCivs.forEach(c => {
    if (!c.isAlive) return
    if (c.hp <= 0 || c.food <= 0 || c.territories <= 0) {
      c.isAlive = false
      const reason = c.hp <= 0 ? 'HP reached 0' : c.food <= 0 ? 'starvation' : 'all territories lost'
      logs.push({ turn, message: `${c.name} has been eliminated! (${reason})`, type: 'elimination' })
    }
  })

  return { civs: newCivs, grid: newGrid, logs }
}
