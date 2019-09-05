const Drawing = function(canvas) {
  const gl = canvas.getContext('webgl')
  const Telement = document.getElementById('T')

  let playerRotX = 0
  let playerRotY = 0
  const playerPos = [0, 0, 2]
  const viewMatrix = new Float32Array(16)
  const projectionMatrix = new Float32Array(16)
  calcProjectionMatrix()

  const screenWidth = canvas.clientWidth
  const screenHeight = canvas.clientHeight
  this.scale = 1.5

  let camera = { x: 0, y: 0 }
  this.accumulator = 0

  const interpolate = (position, movementVector) => {
    return position.sub(movementVector.mul(1 - Settings.tps * this.accumulator))
  }

  this.setCamera = (position, movementVector) => {
    camera = interpolate(position, movementVector)

    // TODO - update view matrix
  }

  this.bg = () => {}

  this.timer = time => {
    const r = 255
    const b = Math.floor(255 * (1 - time / Settings.timeToDie))

    // TODO:
    Telement.innerText = time.toFixed(1)
    //ctx.fillStyle = `rgb(${r},${b},${b})`
    //ctx.font = '48px serif'
    //ctx.fillText(time.toFixed(1), 10, 40)
  }

  this.player = player => {
    // TODO interpolate(player.position, player.movementVector), 10
  }

  this.ghost = ghost => {
    if (ghost.dead) {
      return false
    }
    // TODO interpolate(ghost.position, ghost.movementVector), 10
  }

  this.level = level => {}

  this.titleScreen = () => {}

  this.endScreen = () => {}

  function calcViewMatrix(out = viewMatrix) {
    mat4.identity(out)
    mat4.rotateX(out, out, playerRotX)
    mat4.rotateY(out, out, playerRotY)
    mat4.rotateZ(out, out, -Math.PI)
    mat4.translate(out, out, [-playerPos[0], -playerPos[1], -playerPos[2]])
  }

  function calcProjectionMatrix() {
    const zMin = 0.1
    const zMax = 100
    const a = canvasWidth / canvasHeight
    const angle = 40
    const ang = Math.tan((angle * 0.5 * Math.PI) / 180) //angle*.5
    projectionMatrix[0] = 0.5 / ang
    projectionMatrix[5] = (0.5 * a) / ang
    projectionMatrix[10] = -(zMax + zMin) / (zMax - zMin)
    projectionMatrix[11] = -1
    projectionMatrix[14] = (-2 * zMax * zMin) / (zMax - zMin)
  }

  function init() {
    let pointerLocked = false

    canvas.addEventListener('mousemove', e => {
      if (pointerLocked) {
        const camRotSpeed = 0.01
        playerRotY += (e.movementX || 0) * camRotSpeed
        if (playerRotY < 0) {
          playerRotY += Math.PI * 2
        }
        if (playerRotY >= Math.PI * 2) {
          playerRotY -= Math.PI * 2
        }
        playerRotX += (e.movementY || 0) * camRotSpeed
        if (playerRotX < -Math.PI * 0.5) {
          playerRotX = -Math.PI * 0.5
        }
        if (playerRotX > Math.PI * 0.5) {
          playerRotX = Math.PI * 0.5
        }
      }
    })

    canvas.addEventListener('mousedown', e => {
      if (e.button === 0) {
        if (!pointerLocked) {
          canvas.requestPointerLock()
        }
      } else {
        document.exitPointerLock()
      }
    })

    document.addEventListener(
      'pointerlockchange',
      () => {
        pointerLocked = document.pointerLockElement === canvas
      },
      false
    )
  }

  init()
}
