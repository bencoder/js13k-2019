const footstep = new Audio(
  jsfxr([0, , 0.1074, , 0.0725, 0.589, , -0.911, 0.0889, , , 0.533, , 0.5665, , , 0.5549, , 0.389, 0.867, , , , 0.5])
)
const doorOpen = new Audio(
  jsfxr([
    3,
    0.2335,
    0.222,
    0.122,
    0.289,
    0.5344,
    ,
    -0.889,
    0.6219,
    0.089,
    0.0665,
    0.8163,
    0.1789,
    0.311,
    -0.8902,
    0.6722,
    0.7017,
    -0.422,
    0.3189,
    ,
    0.6312,
    ,
    0.0424,
    0.5
  ])
)
const doorClose = new Audio(
  jsfxr([
    3,
    0.2335,
    0.222,
    0.122,
    0.289,
    0.5344,
    ,
    -0.889,
    0.6219,
    0.089,
    0.0665,
    0.8163,
    0.1789,
    0.311,
    -0.8902,
    0.6722,
    0.7017,
    0.355,
    0.3189,
    ,
    0.6312,
    ,
    0.0424,
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
    //doorOpen.play()
  },
  doorClose() {
    //doorClose.play()
  },
  death() {
    //death.play()
  },
  win() {
    //winLevel.play()
  }
}
