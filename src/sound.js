const fxr = jsfxr
const move = []
move[0] = new Audio(
  fxr([
    2,
    0.1835,
    0.3165,
    ,
    0.466,
    0.172,
    ,
    -0.0109,
    1,
    0.261,
    0.228,
    0.7,
    0.428,
    0.2505,
    -0.002,
    1,
    -0.2329,
    0.1,
    0.968,
    -0.0003,
    0.413,
    0.1634,
    -0.01,
    0.5
  ])
)
move[0].volume = 0.7
move[1] = move[0].cloneNode()
move[1].volume = 0.7
move[2] = move[0].cloneNode()
move[2].volume = 0.7

const switchDown = new Audio(
  fxr([2, 0.0102, 0.066, 0.539, 0.1037, 0.2835, , -0.189, -0.322, , , 0.8999, , , , , , , 1, , , , , 0.5])
)
const switchUp = new Audio(
  fxr([2, 0.0102, 0.066, 0.539, 0.1037, 0.239, , -0.189, -0.322, , , 0.8999, , , , , , , 1, , , , , 0.5])
)
switchDown.volume = 0.5
switchUp.volume = 0.5

const death = new Audio(fxr([1, , 0.3266, , 0.2971, 0.2594, , 0.2258, , , , , , , , 0.7482, , , 1, , , , , 0.5]))
death.volume = 0.3

const winLevel = new Audio(
  fxr([0, , 0.261, , 0.8055, 0.4874, , 0.1788, , , , , , 0.2292, , 0.4519, , , 1, , , , , 0.5])
)
winLevel.volume = 0.3

let movePlaying = false
let moveIndex = 0

const Sounds = {
  move() {
    if (!movePlaying) {
      movePlaying = true
      moveIndex++
      if (moveIndex == move.length) moveIndex = 0
      move[moveIndex].play()
      setTimeout(() => {
        movePlaying = false
      }, 400)
    }
  },
  switchDown() {
    switchDown.play()
  },
  switchUp() {
    switchUp.play()
  },
  death() {
    death.play()
  },
  win() {
    winLevel.play()
  }
}
