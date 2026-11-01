export interface ThreadPoint {
  x: number
  y: number
}

const smooth = (value: number) => {
  const t = Math.max(0, Math.min(1, value))
  return t * t * (3 - 2 * t)
}

function curveThrough(points: readonly ThreadPoint[]) {
  const coordinate = (value: number) => value.toFixed(3)
  let path = `M${coordinate(points[0].x)} ${coordinate(points[0].y)}`
  for (let index = 0; index < points.length - 1; index++) {
    const before = points[Math.max(0, index - 1)]
    const start = points[index]
    const end = points[index + 1]
    const after = points[Math.min(points.length - 1, index + 2)]
    path += ` C${coordinate(start.x + (end.x - before.x) / 6)} ${coordinate(start.y + (end.y - before.y) / 6)} ${coordinate(end.x - (after.x - start.x) / 6)} ${coordinate(end.y - (after.y - start.y) / 6)} ${coordinate(end.x)} ${coordinate(end.y)}`
  }
  return path
}

// Material order follows the original pen stroke: start of D -> end of P.
// Only the advancing pickup front moves each section into the reel. The untouched
// tail stays in its handwritten shape until the same continuous string reaches it.
export function createStringWinding(
  source: readonly ThreadPoint[],
  destination: ThreadPoint,
) {
  const frontWidth = 0.14
  const coils = source.map((point, index) => {
    const material = index / (source.length - 1)
    const angle = Math.PI + material * Math.PI * 4.7
    const radius = 2 + material * 54
    return {
      point,
      material,
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    }
  })

  function pointsAt(
    progress: number,
    turn = progress * Math.PI * 5.5,
    scale = 1,
  ) {
    const t = Math.max(0, Math.min(1, progress))
    const travel = smooth(t)
    const center = {
      x: source[0].x + (destination.x - source[0].x) * travel,
      y: source[0].y + (destination.y - source[0].y) * travel,
    }
    const cos = Math.cos(turn)
    const sin = Math.sin(turn)
    return coils.map(({ point, material, x, y }) => {
      const pickup = smooth((t * (1 + frontWidth) - material) / frontWidth)
      const woundX = center.x + (x * cos - y * sin) * scale
      const woundY = center.y + (x * sin + y * cos) * scale
      return {
        x: point.x + (woundX - point.x) * pickup,
        y: point.y + (woundY - point.y) * pickup,
      }
    })
  }

  return {
    pointsAt,
    pathAt: (progress: number, turn?: number, scale?: number) =>
      curveThrough(pointsAt(progress, turn, scale)),
  }
}
