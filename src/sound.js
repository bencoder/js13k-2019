const footstep = new Audio(
  jsfxr([0, , 0.1074, , 0.0725, 0.589, , -0.911, 0.0889, , , 0.533, , 0.5665, , , 0.5549, , 0.389, 0.867, , , , 0.5])
)
const doorOpen = new Audio(
  jsfxr([
    1,
    0.361,
    0.01,
    ,
    0.3835,
    0.8165,
    0.472,
    -0.3,
    -0.0109,
    ,
    ,
    ,
    ,
    0.1925,
    0.111,
    ,
    -0.0109,
    0.056,
    1,
    ,
    ,
    ,
    ,
    0.5
  ])
)
const doorClose = new Audio(
  jsfxr([
    1,
    0.228,
    0.01,
    ,
    0.1835,
    0.428,
    0.3835,
    0.189,
    -0.0109,
    ,
    ,
    ,
    ,
    0.1925,
    0.111,
    ,
    0.0329,
    0.056,
    0.539,
    ,
    0.272,
    0.1055,
    -0.4329,
    0.5
  ])
)

const death = new Audio(
  jsfxr([1, , 0.2711, , 0.3143, 0.511, , 0.1779, -0.267, 0.2011, 0.4152, , , , , , , , 1, -0.045, , , , 0.5])
)

const winLevel = new Audio(
  jsfxr([1, , 0.0172, , 0.4828, 0.3441, , 0.2476, , 0.3651, 0.4136, , , , , , , , 1, , , , , 0.5])
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
  doorOpen() {
    doorOpen.play()
  },
  doorClose() {
    doorClose.play()
  },
  death() {
    //death.play()
  },
  win() {
    //winLevel.play()
  }
}
