import { useState, useEffect, useRef } from 'react'
import type { Territory, Civilization } from '../types/game'
import { RESOURCE_ICONS } from '../lib/constants'

interface Props {
  grid: Territory[][]
  civs: Civilization[]
  selectedCiv: number
}

export function GridMap({ grid, civs, selectedCiv }: Props) {
  const prevGrid = useRef<(number | null)[][]>([])
  const [changedCells, setChangedCells] = useState<Set<string>>(new Set())
  const [hoveredCell, setHoveredCell] = useState<string | null>(null)

  // Detect territory changes and animate
  useEffect(() => {
    const current = grid.map(row => row.map(t => t.owner))
    const changed = new Set<string>()
    if (prevGrid.current.length > 0) {
      for (let y = 0; y < current.length; y++) {
        for (let x = 0; x < current[y].length; x++) {
          if (prevGrid.current[y]?.[x] !== current[y][x]) {
            changed.add(`${x}-${y}`)
          }
        }
      }
    }
    prevGrid.current = current
    if (changed.size > 0) {
      setChangedCells(changed)
      const timer = setTimeout(() => setChangedCells(new Set()), 800)
      return () => clearTimeout(timer)
    }
  }, [grid])

  // Check adjacency to selected civ's territory
  const isAdjacentToSelected = (x: number, y: number): boolean => {
    const dirs = [[-1,0],[1,0],[0,-1],[0,1]]
    return dirs.some(([dx,dy]) => {
      const nx = x + dx, ny = y + dy
      return nx >= 0 && nx < 5 && ny >= 0 && ny < 5 && grid[ny][nx].owner === selectedCiv
    })
  }

  return (
    <div className="rounded border p-3 corner-deco"
      style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}>
      <div className="grid grid-cols-5 gap-1.5">
        {grid.flat().map((t) => {
          const owner = t.owner !== null ? civs[t.owner] : null
          const isSelected = t.owner === selectedCiv
          const justChanged = changedCells.has(`${t.x}-${t.y}`)
          const isHovered = hoveredCell === `${t.x}-${t.y}`
          const adjacent = !owner && isAdjacentToSelected(t.x, t.y)

          return (
            <div
              key={`${t.x}-${t.y}`}
              className={`aspect-square flex flex-col items-center justify-center text-lg font-bold transition-all duration-300 cursor-default relative grid-cell hex-clip
                ${isSelected ? 'scale-105 z-10' : ''}
                ${justChanged ? 'animate-capture-flash scale-110 z-10' : ''}
              `}
              style={{
                backgroundColor: owner ? `${owner.color}12` : 'var(--c-surface-alt)',
                borderWidth: 1,
                borderStyle: 'solid',
                borderColor: owner ? `${owner.color}${isSelected ? 'cc' : '44'}` : adjacent ? '#ffffff10' : 'var(--c-border)',
                boxShadow: owner
                  ? justChanged
                    ? `0 0 30px ${owner.color}55, inset 0 0 15px ${owner.color}25`
                    : isSelected
                      ? `0 0 20px ${owner.color}33, inset 0 0 10px ${owner.color}15`
                      : `0 0 4px ${owner.color}15`
                  : 'none',
              }}
              onMouseEnter={() => setHoveredCell(`${t.x}-${t.y}`)}
              onMouseLeave={() => setHoveredCell(null)}
            >
              <span className="text-sm select-none">{RESOURCE_ICONS[t.resource]}</span>
              {owner && (
                <span className="absolute bottom-0.5 right-1 w-1.5 h-1.5 rounded-full" style={{
                  backgroundColor: owner.color,
                  opacity: 0.7,
                  boxShadow: `0 0 4px ${owner.color}`,
                }} />
              )}
              {/* Tooltip on hover — flip below for top row */}
              {isHovered && (
                <div className={`absolute left-1/2 -translate-x-1/2 border px-2 py-0.5 text-[9px] whitespace-nowrap z-20 ${t.y === 0 ? 'top-full mt-1' : '-top-8'}`}
                  style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border-bright)', color: 'var(--c-text-dim)', fontFamily: 'var(--font-mono)' }}>
                  [{t.x},{t.y}] {t.resource}{owner ? ` :: ${owner.name}` : ' :: unclaimed'}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 pt-2 mt-1 border-t" style={{ borderColor: 'var(--c-border)' }}>
        {civs.map((c) => {
          const count = grid.flat().filter(t => t.owner === c.id).length
          return (
            <span key={c.id} className={`text-[10px] flex items-center gap-1.5 transition-all ${!c.isAlive ? 'opacity-20 line-through' : ''} ${c.id === selectedCiv ? 'font-bold' : ''}`}
              style={{ fontFamily: 'var(--font-mono)' }}>
              <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{
                backgroundColor: c.color,
                boxShadow: c.id === selectedCiv ? `0 0 8px ${c.color}` : 'none',
              }} />
              <span style={{ color: c.color }}>{count}</span>
            </span>
          )
        })}
      </div>
    </div>
  )
}
