const { sin, cos, tan, hypot, atan2, sqrt, abs, floor, round, PI } = Math
const PI2 = PI * 2

const colour = (r, g, b) => [r / 255, g / 255, b / 255]

const clamp01 = t => (t > 0 ? (t > 1 ? 1 : t) : 0)

const angleLerp = (a0, a1, t) => {
  const da = (a1 - a0) % PI2
  return a0 + (((2 * da) % PI2) - da) * clamp01(t)
}

const lerp = (v0, v1, t) => {
  t = clamp01(t)
  return v0 * (1 - t) + v1 * t
}
