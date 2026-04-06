import type { Civilization, Territory, ResourceType, Phase } from '../types/game'
import type { OnChainCivilization, OnChainTerritory } from '../torii'
import { COLORS, GRID_SIZE, RESOURCE_MAP } from './constants'

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
