import type { Civilization, Territory, ResourceType, Phase, LogEntry } from '../types/game'
import type { OnChainCivilization, OnChainTerritory } from '../torii'
import { COLORS, GRID_SIZE, RESOURCE_MAP } from './constants'
import { getTechLevel } from '../components/TechTree'

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

export function generateCivs(startingHP = 100, startingFood = 50): Civilization[] {
  return COLORS.map((c, i) => ({
    id: i,
    name: c.name,
    color: c.color,
    neonClass: c.neonClass,
    hp: startingHP, maxHp: startingHP,
    food: startingFood, metal: 30, knowledge: 10,
    territories: 1, isAlive: true, prompt: '',
  }))
}

export function assignStartingTerritories(grid: Territory[][]): Territory[][] {
  const corners = [[0, 0], [4, 0], [0, 4], [4, 4]]
  const newGrid = grid.map(row => row.map(t => ({ ...t })))
  corners.forEach(([x, y], i) => { newGrid[y][x].owner = i })
  return newGrid
}

// === Mock simulation (mirrors on-chain logic for offline play) ===

function chooseAction(civ: Civilization, civs: Civilization[]): string {
  const prompt = civ.prompt.toLowerCase()
  const alive = civs.filter(c => c.isAlive && c.id !== civ.id)

  if (civ.food < 10) return 'gather'
  if (civ.hp < 15) return Math.random() > 0.2 ? 'defend' : 'gather'

  if (prompt) {
    let attackW = 0, defendW = 0, gatherW = 0, tradeW = 0
    if (/aggro|attack|offensive|war|conquer|destroy|kill|crush|invade/.test(prompt)) attackW += 5
    if (/turtle|defend|defensive|protect|fortif|shield|safe|surviv/.test(prompt)) defendW += 5
    if (/econ|gather|resource|farm|harvest|build|grow/.test(prompt)) gatherW += 5
    if (/trade|diplomacy|diplomat|peace|ally|alliance/.test(prompt)) tradeW += 5
    if (/chaos|random|unpredictable|wild|crazy/.test(prompt)) {
      return ['gather', 'attack', 'defend', 'trade'][Math.floor(Math.random() * 4)]
    }
    const total = attackW + defendW + gatherW + tradeW
    if (total > 0) {
      const roll = Math.random() * total
      if (roll < attackW) return alive.length > 0 ? 'attack' : 'gather'
      if (roll < attackW + defendW) return 'defend'
      if (roll < attackW + defendW + gatherW) return 'gather'
      return 'trade'
    }
  }

  if (civ.hp < 30) return Math.random() > 0.3 ? 'defend' : 'gather'
  if (civ.food < 20) return Math.random() > 0.3 ? 'gather' : 'trade'
  if (civ.metal > 60 && alive.length > 1) return 'attack'
  return ['gather', 'attack', 'defend', 'trade'][Math.floor(Math.random() * 4)]
}

export function simulateTurn(
  civs: Civilization[], grid: Territory[][], turn: number,
  settings?: { foodDrain?: number; eventFrequency?: number },
): { civs: Civilization[]; grid: Territory[][]; logs: LogEntry[] } {
  const foodDrain = settings?.foodDrain ?? 3
  const eventFreq = settings?.eventFrequency ?? 5
  const newCivs = civs.map(c => ({ ...c }))
  const newGrid = grid.map(row => row.map(t => ({ ...t })))
  const logs: LogEntry[] = []
  const alive = newCivs.filter(c => c.isAlive)

  for (const civ of alive) {
    const action = chooseAction(civ, newCivs)
    const c = newCivs[civ.id]

    if (action === 'gather') {
      const bonus = Math.floor(Math.random() * 10 * Math.min(Math.max(1, c.territories), 3)) + 5
      const techBonus = getTechLevel(c.knowledge) >= 1 ? 2 : 0
      const mult = getTechLevel(c.knowledge) >= 6 ? 1.5 : 1
      const final_ = Math.floor((bonus + techBonus) * mult)
      const ownedTiles = newGrid.flat().filter(t => t.owner === civ.id)
      const res = ownedTiles.length > 0
        ? ownedTiles[Math.floor(Math.random() * ownedTiles.length)].resource
        : (['food', 'metal', 'knowledge'] as ResourceType[])[Math.floor(Math.random() * 3)]
      c[res] += final_
      logs.push({ turn, message: `${c.name} gathered +${final_} ${res}`, type: 'action' })
    } else if (action === 'attack') {
      const targets = alive.filter(t => t.id !== civ.id)
      if (targets.length > 0) {
        const target = targets[Math.floor(Math.random() * targets.length)]
        const t = newCivs[target.id]
        const baseDmg = Math.floor(Math.random() * 15) + 5
        const metalBonus = Math.min(Math.floor(c.metal / 20), 10)
        const techAttack = getTechLevel(c.knowledge) >= 2 ? 3 : 0
        const knowledgeDef = Math.min(Math.floor(t.knowledge / 15), 8)
        const dmg = Math.max(3, baseDmg + metalBonus + techAttack - knowledgeDef)
        t.hp = Math.max(0, t.hp - dmg)
        c.metal = Math.max(0, c.metal - 5)
        logs.push({ turn, message: `${c.name} attacked ${t.name} for ${dmg} damage!`, type: 'combat' })
        if (Math.random() > 0.6) {
          const tt = newGrid.flat().filter(tile => tile.owner === target.id)
          if (tt.length > 0) {
            const cap = tt[Math.floor(Math.random() * tt.length)]
            newGrid[cap.y][cap.x].owner = civ.id
            c.territories++
            t.territories = Math.max(0, t.territories - 1)
            logs.push({ turn, message: `${c.name} captured territory from ${t.name}!`, type: 'combat' })
          }
        }
      }
    } else if (action === 'defend') {
      const techHeal = getTechLevel(c.knowledge) >= 4 ? 3 : 0
      const heal = 5 + Math.min(Math.floor(c.knowledge / 10), 5) + techHeal
      c.hp = Math.min(c.maxHp, c.hp + heal)
      logs.push({ turn, message: `${c.name} fortified defenses (+${heal} HP)`, type: 'action' })
    } else {
      const kb = Math.min(Math.floor(c.knowledge / 20), 5)
      c.food += 8 + kb
      c.knowledge += 3 + Math.floor(kb / 2)
      logs.push({ turn, message: `${c.name} traded resources`, type: 'trade' })
    }
    c.food = Math.max(0, c.food - foodDrain)
  }

  if (turn % eventFreq === 0 && turn > 0) {
    const roll = Math.random()
    const aliveNow = newCivs.filter(c => c.isAlive)
    if (roll < 0.25 && aliveNow.length > 0) {
      const loss = Math.floor(Math.random() * 10) + 5
      aliveNow.forEach(c => { c.food = Math.max(0, c.food - loss) })
      logs.push({ turn, message: `FAMINE — All civilizations lose ${loss} food`, type: 'system' })
    } else if (roll < 0.5 && aliveNow.length > 0) {
      const lucky = aliveNow[Math.floor(Math.random() * aliveNow.length)]
      const bonus = Math.floor(Math.random() * 15) + 10
      lucky.food += bonus
      lucky.metal += Math.floor(bonus / 2)
      logs.push({ turn, message: `BOUNTY — ${lucky.name} discovers resources (+${bonus} food)`, type: 'system' })
    } else if (roll < 0.7) {
      const unlucky = aliveNow[Math.floor(Math.random() * aliveNow.length)]
      const dmg = Math.floor(Math.random() * 15) + 5
      unlucky.hp = Math.max(1, unlucky.hp - dmg)
      logs.push({ turn, message: `PLAGUE hits ${unlucky.name}! -${dmg} HP`, type: 'system' })
    } else if (roll < 0.85) {
      const gain = Math.floor(Math.random() * 8) + 3
      aliveNow.forEach(c => { c.knowledge += gain })
      logs.push({ turn, message: `RENAISSANCE — All civilizations gain +${gain} knowledge`, type: 'system' })
    }
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
