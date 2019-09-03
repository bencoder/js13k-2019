const Drawing = function(c) {
  let screenWidth
  let screenHeight
  const scale = 1.5
  const setScreen = () => {
    screenWidth = c.width = c.clientWidth
    screenHeight = c.height = c.clientHeight
  }
  setScreen()
  window.addEventListener('resize', setScreen)

  const ctx = c.getContext('2d')

  const patterns = {
    grass: ctx.createPattern(grass, 'repeat')
  }

  let camera = { x: 0, y: 0 }
  this.accumulator = 0

  const interpolate = (position, movementVector) => {
    return position.sub(movementVector.mul(1 - Settings.tps * this.accumulator))
  }

  const worldToScreen = ({ x, y }) => ({
    x: (x - camera.x) * scale + screenWidth / 2,
    y: (y - camera.y) * scale + screenHeight / 2
  })

  const color = clr => {
    ctx.fillStyle = clr
    ctx.strokeStyle = clr
  }
  const poly = polygon => {
    const screenPoly = polygon.map(worldToScreen)
    ctx.beginPath()
    ctx.moveTo(screenPoly[0].x, screenPoly[0].y)
    for (let i = 1; i < screenPoly.length; i++) {
      ctx.lineTo(screenPoly[i].x, screenPoly[i].y)
    }
    ctx.closePath()
    ctx.stroke()
  }
  const circle = (center, r, fill = false) => {
    const { x, y } = worldToScreen(center)
    ctx.beginPath()
    ctx.arc(x, y, r * scale, 0, 2 * Math.PI)
    ctx.stroke()
    if (fill) {
      ctx.fill()
    }
  }

  const image = (pos, img) => {
    const p = worldToScreen(pos)
    if (p.x < -img.width * 2 || p.y < -img.height * 2 || p.x > screenWidth || p.y > screenHeight) {
      return
    }
    ctx.drawImage(img, p.x, p.y, img.width * scale, img.height * scale)
  }

  const imageLine = (p1, p2, tex) => {
    const size = tex.width //needs to be a square
    const v = {
      x: p2.x - p1.x,
      y: p2.y - p1.y
    }
    const length = Math.sqrt(v.x * v.x + v.y * v.y)
    const s = {
      x: (v.x / length) * size,
      y: (v.y / length) * size
    }
    for (let i = 0; i <= length / size; i++) {
      const p = {
        x: p1.x + s.x * i - size / 2,
        y: p1.y + s.y * i - size / 2
      }
      image(p, tex)
    }
  }

  const imagePolyLine = (polygon, tex) => {
    for (let i = 0; i < polygon.length - 1; i++) {
      imageLine(polygon[i], polygon[i + 1], tex)
    }
  }

  const fpCache = {}
  const filledImagePoly = (polygon, tex) => {
    const key = JSON.stringify(polygon)
    if (fpCache[key]) {
      image(fpCache[key].pos, fpCache[key].image)
    }
    const min = { x: 10000, y: 10000 }
    const max = { x: 0, y: 0 }
    for (const p of polygon) {
      min.x = min.x < p.x ? min.x : p.x
      min.y = min.y < p.y ? min.y : p.y
      max.x = max.x > p.x ? max.x : p.x
      max.y = max.y > p.y ? max.y : p.y
    }

    const canvas = new OffscreenCanvas(max.x - min.x, max.y - min.y)
    const ct = canvas.getContext('2d')
    ct.fillStyle = ctx.createPattern(tex, 'repeat')
    const p = polygon.map(point => ({ x: point.x - min.x, y: point.y - min.y }))
    ct.beginPath()
    ct.moveTo(p[0].x, p[0].y)
    for (let i = 1; i < p.length; i++) {
      ct.lineTo(p[i].x, p[i].y)
    }
    ct.closePath()
    ct.fill()
    fpCache[key] = { pos: min, image: canvas }
    image(min, canvas)
  }

  this.setCamera = (position, movementVector) => {
    camera = interpolate(position, movementVector)
  }

  this.bg = () => {
    for (let y = -1000; y < 3000; y += grass.height) {
      for (let x = -1000; x < 3000; x += grass.width) {
        image({ x, y }, grass)
      }
    }
  }

  this.timer = time => {
    const r = 255
    const b = Math.floor(255 * (1 - time / Settings.timeToDie))

    ctx.fillStyle = `rgb(${r},${b},${b})`
    ctx.font = '48px serif'
    ctx.fillText(time.toFixed(1), 10, 40)
  }

  this.player = player => {
    color('green')
    circle(interpolate(player.position, player.movementVector), 10, true)
  }

  this.ghost = ghost => {
    if (ghost.dead) {
      return
    }
    color('yellow')
    circle(interpolate(ghost.position, ghost.movementVector), 10, true)
  }

  this.level = level => {
    level.walls.forEach(w => filledImagePoly(w, cobbles))
    level.walls.forEach(w => imagePolyLine(w, brick))

    color('purple')
    level.doors.filter(door => !door.open).forEach(door => poly(door.polygon))

    color('yellow')
    level.switches.forEach(s => {
      circle(s, Settings.switchRadius)
      if (s.pressed) {
        circle(s, Settings.switchRadius - 2)
      }
    })
  }
}
