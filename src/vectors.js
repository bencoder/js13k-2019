function Vec2(x, y) {
  this.x = x
  this.y = y
  this.add = v => new Vec2(this.x + v.x, this.y + v.y)
  this.sub = v => new Vec2(this.x - v.x, this.y - v.y)
  this.len = () => Math.sqrt(this.x * this.x + this.y * this.y)
  this.mul = n => new Vec2(this.x * n, this.y * n)
  this.normal = () => new Vec2(-this.y / this.len(), this.x / this.len())
  this.copy = () => new Vec2(this.x, this.y)
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
