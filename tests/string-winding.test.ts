import { describe, it, expect } from 'vitest'
import { createStringWinding } from '../src/components/intro/string-winding'

describe('signature string winding', () => {
  const source = Array.from({ length: 101 }, (_, index) => ({
    x: 100 + index * 4,
    y: 180 + Math.sin(index / 10) * 30,
  }))
  const destination = { x: 470, y: 104 }
  const winding = createStringWinding(source, destination)

  it('begins in the exact handwritten shape', () => {
    expect(winding.pointsAt(0)).toEqual(source)
  })

  it('picks up the D end first while leaving the unconsumed P tail in place', () => {
    const early = winding.pointsAt(0.25)
    expect(early[0]).not.toEqual(source[0])
    expect(early[15]).not.toEqual(source[15])
    expect(early.slice(40)).toEqual(source.slice(40))
    expect(source[100].x).toBe(500)
  })

  it('finishes as one finite, compact coil at the ball position', () => {
    const end = winding.pointsAt(1)
    expect(
      end.every(
        (point) =>
          Math.hypot(point.x - destination.x, point.y - destination.y) <=
          56.001,
      ),
    ).toBe(true)
    for (const progress of [0, 0.1, 0.5, 0.9, 1]) {
      const path = winding.pathAt(progress)
      expect(path.match(/M/g)).toHaveLength(1)
      expect(path).not.toMatch(/NaN|Infinity/)
    }
  })

  it('rotates the collected string while the P tail is still unwrapped', () => {
    const before = winding.pointsAt(0.5, 0)
    const after = winding.pointsAt(0.5, Math.PI / 2)
    const center = {
      x: (source[0].x + destination.x) / 2,
      y: (source[0].y + destination.y) / 2,
    }
    expect(after[10].x - center.x).toBeCloseTo(-(before[10].y - center.y), 8)
    expect(after[10].y - center.y).toBeCloseTo(before[10].x - center.x, 8)
    expect(after.slice(70)).toEqual(source.slice(70))
  })
})
