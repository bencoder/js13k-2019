const colour = (r, g, b) => [r / 255, g / 255, b / 255]

const clamp01 = t => (t > 0 ? (t > 1 ? 1 : t) : 0)

const angleLerp = (a0, a1, t) => {
  const max = Math.PI * 2
  const da = (a1 - a0) % max
  return a0 + (((2 * da) % max) - da) * clamp01(t)
}

const lerp = (v0, v1, t) => {
  t = clamp01(t)
  return v0 * (1 - t) + v1 * t
}

class Vec2 {
  constructor(x, y) {
    this.x = x
    this.y = y
  }

  add(v) {
    return new Vec2(this.x + v.x, this.y + v.y)
  }

  sub(v) {
    return new Vec2(this.x - v.x, this.y - v.y)
  }

  len() {
    const {
      x,
      y
    } = this
    return Math.sqrt(x * x + y * y)
  }

  mul(n) {
    return new Vec2(this.x * n, this.y * n)
  }

  normal() {
    const len = this.len()
    return new Vec2(-this.y / len, this.x / len)
  }

  normalize() {
    const len = this.len()
    return new Vec2(this.x / len, this.y / len)
  }

  copy() {
    return new Vec2(this.x, this.y)
  }
}

const Vec3 = {
  add: (p1, p2) => [p1[0] + p2[0], p1[1] + p2[1], p1[2] + p2[2]],
  sub: (p1, p2) => [p1[0] - p2[0], p1[1] - p2[1], p1[2] - p2[2]],
  dot: (p1, p2) => p1[0] * p2[0] + p1[1] * p2[1] + p1[2] * p2[2],
  cross: (p1, p2) => [p1[1] * p2[2] - p1[2] * p2[1], p1[2] * p2[0] - p1[0] * p2[2], p1[0] * p2[1] - p1[1] * p2[0]],
  len: p => Math.sqrt(p[0] * p[0] + p[1] * p[1] + p[2] * p[2]),
  normalize: p => {
    const l = this.len(p)
    return [p[0] / l, p[1] / l, p[2] / l]
  },
  mul: (p, n) => [p[0] * n, p[1] * n, p[2] * n]
}