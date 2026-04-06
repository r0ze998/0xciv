/// Flat-top hex grid positioning utilities

const HEX_RADIUS = 1.0
const COL_SPACING = 1.8
const ROW_SPACING = 1.56
const ODD_COL_OFFSET = 0.78
const GRID_SIZE = 5

// Center offset so the board is centered at origin
const CENTER_X = ((GRID_SIZE - 1) * COL_SPACING) / 2
const CENTER_Z = ((GRID_SIZE - 1) * ROW_SPACING) / 2

export function hexToWorld(col: number, row: number): [number, number, number] {
  const x = col * COL_SPACING - CENTER_X
  const z = row * ROW_SPACING + (col % 2 === 1 ? ODD_COL_OFFSET : 0) - CENTER_Z
  return [x, 0, z]
}

export { HEX_RADIUS, GRID_SIZE }
