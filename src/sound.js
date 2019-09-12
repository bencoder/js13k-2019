const fxr = jsfxr

const footstep = new Audio(
  fxr([0, , 0.1074, , 0.0725, 0.589, , -0.911, 0.0889, , , 0.533, , 0.5665, , , 0.5549, , 0.389, 0.867, , , , 0.5])
)
const switchDown = new Audio(
  fxr([2, 0.0102, 0.066, 0.539, 0.1037, 0.2835, , -0.189, -0.322, , , 0.8999, , , , , , , 1, , , , , 0.5])
)
const switchUp = new Audio(
  fxr([2, 0.0102, 0.066, 0.539, 0.1037, 0.239, , -0.189, -0.322, , , 0.8999, , , , , , , 1, , , , , 0.5])
)
switchDown.volume = 0.5
switchUp.volume = 0.5

const death = new Audio(
  fxr([1, , 0.2711, , 0.3143, 0.511, , 0.1779, -0.267, 0.2011, 0.4152, , , , , , , , 1, -0.045, , , , 0.5])
)

const winLevel = new Audio(
  fxr([1, , 0.0172, , 0.4828, 0.3441, , 0.2476, , 0.3651, 0.4136, , , , , , , , 1, , , , , 0.5])
)

let footstepPlaying = false

const Sounds = {
  step() {
    if (!footstepPlaying) {
      //footstep.play()
      footstepPlaying = true
      setTimeout(() => (footstepPlaying = false), 250)
    }
  },
  switchDown() {
    switchDown.play()
  },
  switchUp() {
    switchUp.play()
  },
  death() {
    //death.play()
  },
  win() {
    //winLevel.play()
  }
}
