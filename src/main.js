const Draw = new Drawing(document.getElementById('c'))
const game = new Game(levels)

const levelIndex = 4
game.loadLevel(levelIndex)

let previous
let accumulator = 0 //stores incrementing value (in seconds) until the next tick, when it's then decremented by 1 tick's length
const update = time => {
  requestAnimationFrame(update)
  if (previous === undefined) {
    previous = time
  }
  const dt = (time - previous) / 1000.0
  accumulator += dt

  if (accumulator > 1.0 / settings_tps) {
    accumulator -= 1.0 / settings_tps
    game.tick()
  }
  if (accumulator > 1.0 / settings_tps) {
    accumulator = 1.0 / settings_tps
  }

  game.draw(accumulator, time / 1000.0, dt)

  previous = time
}
requestAnimationFrame(update)

const keyMap = {
  ArrowUp: 'up',
  KeyW: 'up',
  ArrowDown: 'down',
  KeyS: 'down',
  ArrowLeft: 'left',
  KeyA: 'left',
  ArrowRight: 'right',
  KeyD: 'right',
  Backspace: 'back'
}
window.addEventListener('keydown', ev => {
  if (keyMap[ev.code]) {
    game.buttonDown(keyMap[ev.code])
    ev.preventDefault()
  }
  return false
})
window.addEventListener('keyup', ev => {
  if (keyMap[ev.code]) {
    game.buttonUp(keyMap[ev.code])
    ev.preventDefault()
  }
  return false
})
