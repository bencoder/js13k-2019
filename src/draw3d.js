const Drawing = function(canvas) {
  /** @type {WebGLRenderingContext} */
  const gl = canvas.getContext('webgl')
  const Telement = document.getElementById('T')

  const createGlBuffer = (items, type = gl.ARRAY_BUFFER) => {
    const result = gl.createBuffer()
    gl.bindBuffer(type, result)
    gl.bufferData(type, items, gl.STATIC_DRAW)
    return result
  }

  const vertex_buffer = createGlBuffer(builtVertices)
  const normal_buffer = createGlBuffer(builtNormals)
  const colors_buffer = createGlBuffer(builtColors)
  const index_buffer = createGlBuffer(builtIndices, gl.ELEMENT_ARRAY_BUFFER)

  const canvasWidth = canvas.clientWidth
  const canvasHeight = canvas.clientHeight

  let cameraRotX = 1
  let cameraRotY = 0
  const cameraPos = [0, -1, 2]

  const viewMatrix = new Float32Array(16)
  const projectionMatrix = new Float32Array(16)
  const playerLightPosition = new Float32Array(3)
  calcProjectionMatrix()

  const createGlShasder = (program, input, type) => {
    const shader = gl.createShader(type)
    gl.shaderSource(shader, input)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.log(`Shader compilation failed: ${gl.getShaderInfoLog(shader)}`)
    }
    gl.attachShader(program, shader)
  }

  const shaderProgram = gl.createProgram()
  createGlShasder(shaderProgram, shader_basic_vert, gl.VERTEX_SHADER)
  createGlShasder(shaderProgram, shader_basic_frag, gl.FRAGMENT_SHADER)
  gl.linkProgram(shaderProgram)

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(shaderProgram))
  }

  /* ====== Associating attributes to vertex shader =====*/
  const uPmatrix = gl.getUniformLocation(shaderProgram, 'Pmatrix')
  const uVmatrix = gl.getUniformLocation(shaderProgram, 'Vmatrix')
  const uPosition = gl.getAttribLocation(shaderProgram, 'position')
  const uNormal = gl.getAttribLocation(shaderProgram, 'normal')
  const uColor = gl.getAttribLocation(shaderProgram, 'color')
  const uPlayerLightPosition = gl.getUniformLocation(shaderProgram, 'playerLightPosition')
  const uTranslation = gl.getUniformLocation(shaderProgram, 'inTranslation')
  const uAmbientColor = gl.getUniformLocation(shaderProgram, 'inAmbientColor')
  const uSurfaceSensitivity = gl.getUniformLocation(shaderProgram, 'inSurfaceSensitivity')

  this.scale = 1.5

  this.accumulator = 0

  const interpolate = (position, movementVector) => {
    return position.sub(movementVector.mul(1 - settings_tps * this.accumulator))
  }

  this.setCamera = (position, movementVector) => {
    const camera = interpolate(position, movementVector)

    playerLightPosition[0] = -camera.x * glScale
    playerLightPosition[2] = camera.y * glScale

    cameraPos[0] = -camera.x * glScale
    cameraPos[1] = -1 - this.scale
    cameraPos[2] = 1 + camera.y * glScale
  }

  this.bg = () => {
    calcViewMatrix()

    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)
    gl.clearColor(0, 0, 0, 1)
    gl.clearDepth(1.0)

    gl.viewport(0.0, 0.0, canvasWidth, canvasHeight)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  }

  let timerUpdateTime = 0

  let timerR = 0
  let timerG = 0
  let timerS = 0
  let timerX = 0

  this.timer = time => {
    const t = 1 - time / settings_timeToDie

    const s = Math.ceil(13 - time)

    if (timerS !== s || time - timerUpdateTime > 0.2) {
      if (timerX) {
        Telement.className = ''
      }

      timerUpdateTime = time

      let v = new Vec2(t, 1 - t)
      v = v.normalize()

      const r = round(255 * v.y)
      const g = round(255 * v.x)

      if (r !== timerR || g !== timerG) {
        timerR = r
        timerG = g

        const b = round(128 * v.x * v.x)
        Telement.style.color = `rgb(${r},${g},${b})`
      }

      if (timerS !== s) {
        if (s < 4) {
          timerX = 1
          Telement.className = 'x'
        }
        console.log('TIME')
        timerS = s
        Telement.innerText = s
      }
    }
  }

  let timeDelta = 1

  const playerRotation = (p, movementVector) => {
    let a
    if (!movementVector || (movementVector.x === 0 && movementVector.y === 0)) {
      a = p._a
    }
    if (a === undefined) {
      a = atan2(-movementVector.y, movementVector.x)
      p._a = a
    }
    let r = p._r
    p._r = r = angleLerp(r !== undefined ? r : a, a, timeDelta * 12)
    return PI / 2 - r
  }

  this.player = player => {
    const pos = interpolate(player.position, player.movementVector)
    calcViewMatrix()
    mat4Translate(viewMatrix, -pos.x * glScale, -3.1 * glScale, pos.y * glScale)
    mat4RotateY(viewMatrix, playerRotation(player, player.drawMovementVector))
    gl.uniformMatrix4fv(uVmatrix, false, viewMatrix)
    gl.uniform3f(uAmbientColor, 1, 1, 1)
    gl.drawElements(gl.TRIANGLES, builtSprites.player.ibCount, gl.UNSIGNED_SHORT, builtSprites.player.ibStart * 2)
  }

  this.ghost = ghost => {
    if (ghost.dead) {
      return false
    }
    const pos = interpolate(ghost.position, ghost.movementVector)
    calcViewMatrix()
    mat4Translate(viewMatrix, -pos.x * glScale, -3 * glScale, pos.y * glScale)
    mat4RotateY(viewMatrix, playerRotation(ghost, ghost.movementVector))
    gl.uniformMatrix4fv(uVmatrix, false, viewMatrix)
    gl.drawElements(gl.TRIANGLES, builtSprites.ghost.ibCount, gl.UNSIGNED_SHORT, builtSprites.ghost.ibStart * 2)
    return true
  }

  let endLight
  let currentLevelId
  const levelState = new Map()

  this.level = (level, frameTime, currentTimeDelta) => {
    timeDelta = currentTimeDelta
    if (level.id !== currentLevelId) {
      currentLevelId = level.id
      endLight = 0
      timeDelta = 1
      levelState.clear()
    }

    gl.enable(gl.CULL_FACE)
    gl.cullFace(gl.BACK)

    gl.useProgram(shaderProgram)

    gl.uniform3f(uTranslation, 0, 0, 0)
    gl.uniform3f(uAmbientColor, 1, 1, 1)
    gl.uniformMatrix4fv(uPmatrix, false, projectionMatrix)
    gl.uniformMatrix4fv(uVmatrix, false, viewMatrix)
    gl.uniform3fv(uPlayerLightPosition, playerLightPosition)
    gl.uniform1f(uSurfaceSensitivity, 1)

    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer)

    gl.vertexAttribPointer(uPosition, 3, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(uPosition)

    gl.bindBuffer(gl.ARRAY_BUFFER, normal_buffer)
    gl.vertexAttribPointer(uNormal, 3, gl.FLOAT, true, 0, 0)
    gl.enableVertexAttribArray(uNormal)

    gl.bindBuffer(gl.ARRAY_BUFFER, colors_buffer)
    gl.vertexAttribPointer(uColor, 3, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(uColor)

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer)

    gl.drawElements(gl.TRIANGLES, level.ibCount, gl.UNSIGNED_SHORT, level.ibStart * 2)

    for (const d of level.doors) {
      if (!d.open) {
        gl.drawElements(gl.TRIANGLES, d.ibCount, gl.UNSIGNED_SHORT, d.ibStart * 2)
      }
    }

    gl.uniform1f(uSurfaceSensitivity, 0.4)

    gl.uniform3f(uTranslation, -level.start.x * glScale, glScale, level.start.y * glScale)
    gl.uniform3f(uAmbientColor, 0.1, 0, 0.5)
    gl.drawElements(gl.TRIANGLES, builtSprites.pad.ibCount, gl.UNSIGNED_SHORT, builtSprites.pad.ibStart * 2)

    gl.uniform3f(uTranslation, -level.end.x * glScale, 3 * glScale, level.end.y * glScale)
    endLight = lerp(endLight, lerp(0.7, 1, 1 - abs(cos(frameTime * 1.5))), timeDelta * 4)
    gl.uniform3f(uAmbientColor, 0, endLight / 1.3, endLight)
    gl.drawElements(gl.TRIANGLES, builtSprites.pad.ibCount, gl.UNSIGNED_SHORT, builtSprites.pad.ibStart * 2)

    for (const s of level.switches) {
      const { uid, pressed } = s
      let state = levelState.get(uid)
      if (!state) {
        levelState.set(uid, (state = { r: 1, g: 0, p: 0 }))
      }

      const { r, g, p } = state
      state.r = lerp(r, pressed ? 0.1 : lerp(0.7, 1, 1 - abs(cos(frameTime * 3))), timeDelta * 4)
      state.g = lerp(g, pressed ? 0.3 : 0, timeDelta * 5)
      state.p = lerp(state.p, pressed ? 3.8 * glScale : 0, timeDelta * 8)

      gl.uniform1f(uSurfaceSensitivity, g)

      gl.uniform3f(uTranslation, -s.x * glScale, p, s.y * glScale)
      gl.uniform3f(uAmbientColor, r, g, 0)
      gl.drawElements(gl.TRIANGLES, builtSprites.pad.ibCount, gl.UNSIGNED_SHORT, builtSprites.pad.ibStart * 2)
    }

    gl.uniform1f(uSurfaceSensitivity, 0)
    gl.uniform3f(uTranslation, 0, 0, 0)
  }

  this.titleScreen = () => {}

  this.endScreen = () => {}

  function calcViewMatrix(out = viewMatrix) {
    out.set(mat4Identity)
    mat4RotateX(out, cameraRotX)
    mat4RotateY(out, cameraRotY)
    mat4RotateZ(out, -PI)
    mat4Translate(out, -cameraPos[0], -cameraPos[1], -cameraPos[2])
  }

  function calcProjectionMatrix() {
    const zMin = 0.1
    const zMax = 100
    const a = canvasWidth / canvasHeight
    const angle = 40
    const ang = tan((angle * 0.5 * PI) / 180) //angle*.5
    projectionMatrix[0] = 0.5 / ang
    projectionMatrix[5] = (0.5 * a) / ang
    projectionMatrix[10] = -(zMax + zMin) / (zMax - zMin)
    projectionMatrix[11] = -1
    projectionMatrix[14] = (-2 * zMax * zMin) / (zMax - zMin)
  }

  // TODO: remove this function
  function init() {
    let pointerLocked = false

    canvas.addEventListener('mousemove', e => {
      if (pointerLocked) {
        const camRotSpeed = 0.01
        cameraRotY += (e.movementX || 0) * camRotSpeed
        if (cameraRotY < 0) {
          cameraRotY += PI2
        }
        if (cameraRotY >= PI2) {
          cameraRotY -= PI2
        }
        cameraRotX += (e.movementY || 0) * camRotSpeed
        if (cameraRotX < -PI * 0.5) {
          cameraRotX = -PI * 0.5
        }
        if (cameraRotX > PI * 0.5) {
          cameraRotX = PI * 0.5
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