const COLOR_DEEP_WALLS = colour(0, 50, 100)
const COLOR_PILLARS = colour(0, 80, 230)
const COLOR_SMALL_WALLS = colour(0, 100, 255)
const COLOR_GROUND = colour(20, 60, 170)
const COLOR_DOOR = colour(255, 0, 0)
const COLOR_DOOR_SIDE = colour(100, 100, 100)

let builtVertices
let builtNormals
let builtColors
let builtIndices

const builtSprites = {
  player: {},
  ghost: {},
  pad: {},
  core: {}
}

;(() => {
  const vertices = []
  const normals = []
  const colors = []
  const indices = []

  const topNormal = [0, 1, 0]

  const vertexMap = new Map()

  const getVertex = (xyz, color, normal = topNormal) => {
    const key = JSON.stringify([xyz, color, normal])
    let result = vertexMap.get(key)
    if (result === undefined) {
      result = vertexMap.size
      vertexMap.set(key, result)
      vertices.push(-xyz[0] * glScale, xyz[1] * glScale, xyz[2] * glScale)
      colors.push(...color)
      normals.push(...normal)
    }
    return result
  }

  const makeTriangle = (v0, v1, v2, c) => {
    const U = Vec3.sub(v1, v0)
    const V = Vec3.sub(v2, v0)
    const normal = Vec3.cross(U, V)
    indices.push(getVertex(v0, c, normal), getVertex(v1, c, normal), getVertex(v2, c, normal))
  }

  const makeQuad = (v0, v1, v2, v3, c) => {
    makeTriangle(v0, v1, v3, c)
    makeTriangle(v1, v2, v3, c)
  }

  const makePolygon = (vec2s, y, color) => {
    const a = vec2s[0]
    let b = vec2s[1]
    for (let i = 2, c; i < vec2s.length; ++i, b = c) {
      c = vec2s[i]
      makeTriangle([a[0], y, a[1]], [b[0], y, b[1]], [c[0], y, c[1]], color)
    }
  }

  const makePolygonWithWalls = (pts, y0, y1, c, c2 = c) => {
    makePolygon(pts, y0, c)
    let a = pts[0]
    for (let i = 1, b; i <= pts.length; ++i, a = b) {
      b = pts[i % 6]
      makeQuad([a[0], y1, a[1]], [b[0], y1, b[1]], [b[0], y0, b[1]], [a[0], y0, a[1]], c2)
    }
  }

  const makeHexagon = (centerX, centerZ, radius, y0, y1, c, c2, initAngle = 0) => {
    const pts = []
    for (let i = 0; i < 6; ++i) {
      const angle = initAngle + (i / 6) * PI2
      pts.push([sin(angle) * radius + centerX, cos(angle) * radius + centerZ])
    }
    makePolygonWithWalls(pts, y0, y1, c, c2)
  }

  //b and t are each 4 vertexes, anticlockwise (when looking from above) for bottom and top of the shape
  const makeFrustrum = (b, t, c, c2) => {
    //makeQuad(...b, c)
    makeQuad(...t, c)
    makeQuad(b[0], b[1], t[1], t[0], c2 || c)
    makeQuad(b[0], t[0], t[3], b[3], c2 || c)
    makeQuad(b[3], t[3], t[2], b[2], c2 || c)
    makeQuad(b[2], t[2], t[1], b[1], c2 || c)
  }

  for (const level of levels) {
    level.ibStart = indices.length

    const walls = level.walls
    for (const poly of walls) {
      for (let i = 0; i < poly.length; ++i) {
        const poly0 = poly[i]
        const poly1 = poly[(i + 1) % poly.length]

        const a = new Vec2(poly0.x, poly0.y)
        const b = new Vec2(poly1.x, poly1.y)

        const segmentLength = hypot(b.x - a.x, b.y - a.y)
        if (segmentLength === 0) {
          continue
        }

        const xlen = a.x - b.x
        const zlen = a.y - b.y

        const nx = -zlen / segmentLength
        const nz = xlen / segmentLength

        const width = 5
        const topY = -10
        const bottomY = 1
        const deepdown = 1000

        // deep down
        makeQuad([a.x, deepdown, a.y], [b.x, deepdown, b.y], [b.x, bottomY, b.y], [a.x, bottomY, a.y], COLOR_DEEP_WALLS)

        const offset = new Vec2(nx, nz).mul(width / 2)
        const border = [a.sub(offset), b.sub(offset), b.add(offset), a.add(offset)]
        makeFrustrum(
          [
            [border[0].x, bottomY, border[0].y],
            [border[1].x, bottomY, border[1].y],
            [border[2].x, bottomY, border[2].y],
            [border[3].x, bottomY, border[3].y]
          ],
          [
            [border[0].x, topY, border[0].y],
            [border[1].x, topY, border[1].y],
            [border[2].x, topY, border[2].y],
            [border[3].x, topY, border[3].y]
          ],
          COLOR_SMALL_WALLS
        )

        makeHexagon(a.x, a.y, 6, topY - 2, deepdown, COLOR_PILLARS)
      }
    }

    for (const pts of level.polys) {
      const a = pts[0]
      let b = pts[1]
      for (let i = 2; i < pts.length; ++i) {
        const c = pts[i]
        makeTriangle([a.x, 1, a.y], [b.x, 1, b.y], [c.x, 1, c.y], COLOR_GROUND)
        b = c
      }
    }

    for (const d of level.doors) {
      for (let i = 0, p = d.polygon; i < 2; ++i) {
        makeHexagon(p[i].x, p[i].y, 5, -22, 1, COLOR_DOOR_SIDE)
      }
    }

    level.ibCount = indices.length - level.ibStart

    for (const door of level.doors) {
      const p = door.polygon
      const p0 = new Vec2(p[0].x, p[0].y)
      const p1 = new Vec2(p[1].x, p[1].y)
      const normal = p1.sub(p0).normal()
      const offset = normal.mul(1)
      const border = [p0.sub(offset), p1.sub(offset), p1.add(offset), p0.add(offset)]
      door.ibStart = indices.length
      for (let i = 0; i < 2; ++i) {
        const bottomY = -4 - i * 10
        const topY = -6 - i * 10
        makeFrustrum(
          [
            [border[0].x, bottomY, border[0].y],
            [border[1].x, bottomY, border[1].y],
            [border[2].x, bottomY, border[2].y],
            [border[3].x, bottomY, border[3].y]
          ],
          [
            [border[0].x, topY, border[0].y],
            [border[1].x, topY, border[1].y],
            [border[2].x, topY, border[2].y],
            [border[3].x, topY, border[3].y]
          ],
          COLOR_DOOR
        )
      }
      door.ibCount = indices.length - door.ibStart
    }
  }

  builtSprites.player.ibStart = indices.length
  makeTriangle([0, -1, -10], [0, -3, 5], [7, -1, 5], [0.8, 0, 0.8])
  makeTriangle([0, -1, -10], [-7, -1, 5], [0, -3, 5], [0.6, 0, 0.6])
  makeTriangle([0, -3, 5], [-7, -1, 5], [0, -1, 10], [0.5, 0, 0.4])
  makeTriangle([0, -3, 5], [0, -1, 10], [7, -1, 5], [0.7, 0, 0.4])
  builtSprites.player.ibCount = indices.length - builtSprites.player.ibStart

  builtSprites.ghost.ibStart = indices.length
  makeTriangle([0, -1, -10], [0, -1, 5], [7, -1, 5], [0.2, 0, 0.2])
  makeTriangle([0, -1, -10], [-7, -1, 5], [0, -1, 5], [0.15, 0, 0.15])
  makeTriangle([0, -1, 5], [-7, -1, 5], [0, -1, 10], [0.11, 0, 0.1])
  makeTriangle([0, -1, 5], [0, -1, 10], [7, -1, 5], [0.19, 0, 0.1])
  builtSprites.ghost.ibCount = indices.length - builtSprites.ghost.ibStart

  builtSprites.pad.ibStart = indices.length
  makeHexagon(0, 0, glSwitchRadius, -4, 0.1, [1, 1, 1], [0.5, 0.5, 0.5])
  builtSprites.pad.ibCount = indices.length - builtSprites.pad.ibStart

  builtSprites.core.ibStart = indices.length
  for (let i = 0; i < 25; i += 2) {
    const d = i / 5
    makeHexagon(0, 0, glSwitchRadius, -4 - i * 5, 0.1 - i * 5 + d, [1, 1, 1], [0.5, 0.5, 0.5], i)
  }
  builtSprites.core.ibCount = indices.length - builtSprites.core.ibStart

  builtVertices = new Float32Array(vertices)
  builtNormals = new Float32Array(normals)
  builtColors = new Float32Array(colors)
  builtIndices = new Uint16Array(indices)
})()
