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
      const bonus = Math.floor(Math.random() * 15) + 5
      const res = (['food', 'metal', 'knowledge'] as ResourceType[])[Math.floor(Math.random() * 3)]
      c[res] += bonus
      logs.push({ turn, message: `${c.name} gathered +${bonus} ${RESOURCE_ICONS[res]} ${res}`, type: 'action' })
    } else if (action === 'attack') {
      const targets = alive.filter(t => t.id !== civ.id)
      if (targets.length > 0) {
        const target = targets[Math.floor(Math.random() * targets.length)]
        const t = newCivs[target.id]
        const dmg = Math.floor(Math.random() * 20) + 5
        t.hp = Math.max(0, t.hp - dmg)
        c.metal = Math.max(0, c.metal - 5)
        logs.push({ turn, message: `${c.name} attacked ${t.name} for ${dmg} damage!`, type: 'combat' })
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
      c.hp = Math.min(c.maxHp, c.hp + 5)
      logs.push({ turn, message: `${c.name} fortified defenses (+5 HP)`, type: 'action' })
    } else {
      c.food += 8
      c.knowledge += 3
      logs.push({ turn, message: `${c.name} traded resources (+8 food, +3 knowledge)`, type: 'trade' })
    }
    c.food = Math.max(0, c.food - 3)
  })

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
