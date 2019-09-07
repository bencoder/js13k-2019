const Settings = {
  tps: 20,
  timeToDie: 13,
  playerRadius: 10,
  switchRadius: 20,
  playerSpeed: 5,
  maxGhosts: 4
}

const Draw = new Drawing(document.getElementById('c'))
const game = new Game(levels)

const levelIndex = 1
game.loadLevel(levelIndex)

let previous
let accumulator = 0 //stores incrementing value (in seconds) until the next tick, when it's then decremented by 1 tick's length
const update = time => {
  window.requestAnimationFrame(update)
  if (previous === undefined) {
    previous = time
  }
  const dt = (time - previous) / 1000.0
  accumulator += dt

  if (accumulator > 1.0 / Settings.tps) {
    accumulator -= 1.0 / Settings.tps
    game.tick()
  }
  if (accumulator > 1.0 / Settings.tps) {
    accumulator = 1.0 / Settings.tps
  }

  game.draw(accumulator)

  previous = time
}
window.requestAnimationFrame(update)

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
