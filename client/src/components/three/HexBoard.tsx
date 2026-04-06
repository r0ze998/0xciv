import { useRef, useEffect, useState } from 'react'
import type { Territory, Civilization } from '../../types/game'
import { HexTile } from './HexTile'
import { ResourceMarker } from './ResourceMarker'
import { CivBeacon } from './CivBeacon'
import { TerritoryGlow } from './TerritoryGlow'
import { hexToWorld } from '../../lib/hex-utils'
import { getTechLevel } from '../TechTree'

interface Props {
  grid: Territory[][]
  civs: Civilization[]
  selectedCiv: number
}

export function HexBoard({ grid, civs, selectedCiv }: Props) {
  const prevGrid = useRef<(number | null)[][]>([])
  const [changedCells, setChangedCells] = useState<Set<string>>(new Set())

  // Detect territory changes
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

  const tiles = grid.flat()

  return (
    <group>
      {tiles.map((t) => {
        const owner = t.owner !== null ? civs[t.owner] : null
        const pos = hexToWorld(t.x, t.y)
        const isSelected = t.owner === selectedCiv
        const justCaptured = changedCells.has(`${t.x}-${t.y}`)
        const tooltip = `[${t.x},${t.y}] ${t.resource}${owner ? ` :: ${owner.name}` : ' :: unclaimed'}`

        return (
          <group key={`${t.x}-${t.y}`}>
            <HexTile
              position={pos}
              ownerColor={owner?.color || null}
              resource={t.resource}
              isSelected={isSelected}
              justCaptured={justCaptured}
              tooltipText={tooltip}
            />
            <ResourceMarker
              position={[pos[0], 0.35, pos[2]]}
              resource={t.resource}
              seed={t.x * 5 + t.y}
            />
            {owner && (
              <>
                <TerritoryGlow
                  position={[pos[0], -0.01, pos[2]]}
                  color={owner.color}
                  isSelected={isSelected}
                />
                <CivBeacon
                  position={[pos[0], 0.15, pos[2]]}
                  color={owner.color}
                  techLevel={getTechLevel(owner.knowledge)}
                />
              </>
            )}
          </group>
        )
      })}
    </group>
  )
}
