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
    <div className="bg-gray-900/80 rounded-lg border border-gray-700 p-3">
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
              className={`aspect-square flex flex-col items-center justify-center rounded-md text-lg font-bold transition-all duration-300 cursor-default relative grid-cell
                ${owner ? '' : 'bg-gray-800/40'}
                ${isSelected ? 'ring-2 ring-white/40 scale-105 z-10' : ''}
                ${justChanged ? 'animate-cell-capture scale-110 z-10' : ''}
                ${adjacent ? 'ring-1 ring-dashed ring-white/10' : ''}
              `}
              style={{
                backgroundColor: owner ? `${owner.color}18` : undefined,
                borderWidth: 1,
                borderColor: owner ? `${owner.color}${isSelected ? 'cc' : '66'}` : adjacent ? '#ffffff15' : '#1f2937',
                boxShadow: owner
                  ? justChanged
                    ? `0 0 24px ${owner.color}66, inset 0 0 12px ${owner.color}33`
                    : isSelected
                      ? `0 0 16px ${owner.color}44, inset 0 0 8px ${owner.color}22`
                      : `0 0 6px ${owner.color}22`
                  : 'none',
              }}
              onMouseEnter={() => setHoveredCell(`${t.x}-${t.y}`)}
              onMouseLeave={() => setHoveredCell(null)}
            >
              <span className="text-sm select-none">{RESOURCE_ICONS[t.resource]}</span>
              {owner && (
                <span className="absolute bottom-0.5 right-1 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: owner.color, opacity: 0.6 }} />
              )}
              {/* Tooltip on hover — flip below for top row */}
              {isHovered && (
                <div className={`absolute left-1/2 -translate-x-1/2 bg-gray-800 border border-gray-600 rounded px-2 py-0.5 text-[10px] text-gray-300 whitespace-nowrap z-20 shadow-lg ${t.y === 0 ? 'top-full mt-1' : '-top-8'}`}>
                  ({t.x},{t.y}) {t.resource}{owner ? ` · ${owner.name}` : ' · unclaimed'}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 pt-2 mt-1 border-t border-gray-800">
        {civs.map((c) => {
          const count = grid.flat().filter(t => t.owner === c.id).length
          return (
            <span key={c.id} className={`text-xs flex items-center gap-1.5 transition-all ${!c.isAlive ? 'opacity-30 line-through' : ''} ${c.id === selectedCiv ? 'font-bold' : ''}`}>
              <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: c.color, boxShadow: c.id === selectedCiv ? `0 0 6px ${c.color}` : 'none' }} />
              <span style={{ color: c.color }}>{count}</span>
            </span>
          )
        })}
      </div>
    </div>
  )
}
