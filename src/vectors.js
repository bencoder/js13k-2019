function Vec2(x, y) {
  this.x = x
  this.y = y
  this.add = v => new Vec2(this.x + v.x, this.y + v.y)
  this.sub = v => new Vec2(this.x - v.x, this.y - v.y)
  this.len = () => Math.sqrt(this.x * this.x + this.y * this.y)
  this.mul = n => new Vec2(this.x * n, this.y * n)
  this.copy = () => new Vec2(this.x, this.y)
}
