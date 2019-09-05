const Drawing = function(canvas) {
  const gl = canvas.getContext('webgl')
  const Telement = document.getElementById('T')

  const scale = 1 / 100

  function build() {
    const vertices = []
    const colors = []
    const indices = []

    const vertexMap = new Map()
    const getVertex = (x, y, z, type = 0) => {
      const key = JSON.stringify([x, y, z, type])
      let result = vertexMap.get(key)
      if (result === undefined) {
        result = vertexMap.size
        vertexMap.set(key, result)
        vertices.push(-x * scale, y * scale, z * scale)
        if (type === 0) {
          colors.push(1, 1, 1)
        } else {
          colors.push(0.3, 0.3, type)
        }
      }
      return result
    }

    const makeWallQuad = (x1, y1, z1, x2, y2, z2, type) => {
      const p0 = getVertex(x1, y1, z1, type)
      const p1 = getVertex(x2, y1, z2, type)
      const p2 = getVertex(x1, y2, z1, type)
      const p3 = getVertex(x2, y2, z2, type)
      indices.push(p0, p3, p1, p0, p2, p3)
    }

    const makeFloorQuad = (aX, aY, aZ, bX, bY, bZ, type) => {
      const p0 = getVertex(aX, aY, aZ, type)
      const p1 = getVertex(aX, bY, bZ, type)
      const p2 = getVertex(bX, aY, aZ, type)
      const p3 = getVertex(bX, bY, bZ, type)
      indices.push(p0, p3, p1, p0, p2, p3)
    }

    for (const level of levels) {
      const indexBufferOffset = indices.length

      const walls = level.walls
      for (const poly of walls) {
        for (let i = 0; i < poly.length; ++i) {
          const a = new Vec2(poly[i].x, poly[i].y)
          const bb = poly[(i + 1) % poly.length]
          const b = new Vec2(bb.x, bb.y)
          makeWallQuad(a.x, 1, a.y, b.x, 100, b.y, 0.1)

          const normal = a.sub(b).normal()
          const width = 5
          const topY = -10
          const bottomY = 1
          const quad = [
            a.add(normal.mul(width / 2)),
            b.add(normal.mul(width / 2)),
            b.sub(normal.mul(width / 2)),
            a.sub(normal.mul(width / 2))
          ]
          makeWallQuad(quad[0].x, bottomY, quad[0].y, quad[1].x, topY, quad[1].y, 0.2)
          makeFloorQuad(quad[2].x, topY, quad[2].y, quad[0].x, topY, quad[0].y, 0.2) //top
          makeWallQuad(quad[2].x, bottomY, quad[2].y, quad[3].x, topY, quad[3].y, 0.2)
          const quad2 = [
            a.add({ x: 7, y: 7 }), //front-right
            a.add({ x: 7, y: -7 }), //back-right
            a.add({ x: -7, y: -7 }), //back-left
            a.add({ x: -7, y: 7 }) //front-left
          ]
          makeWallQuad(quad2[0].x, bottomY, quad2[0].y, quad2[3].x, topY, quad2[3].y, 0.2) //front
          makeWallQuad(quad2[2].x, bottomY, quad2[2].y, quad2[3].x, topY, quad2[3].y, 0.2) //left
          makeFloorQuad(quad2[3].x, topY, quad2[3].y, quad2[1].x, topY, quad2[1].y, 0.2) //top
          makeWallQuad(quad2[0].x, bottomY, quad2[0].y, quad2[1].x, topY, quad2[1].y, 0.2) //right
          makeWallQuad(quad2[1].x, bottomY, quad2[1].y, quad2[2].x, topY, quad2[2].y, 0.2) //back
        }
      }

      for (const pts of level.polys) {
        const p0 = pts[0]
        let pHelper = pts[1]
        for (let i = 2; i < pts.length; ++i) {
          const pTemp = pts[i]
          indices.push(getVertex(p0.x, 1, p0.y), getVertex(pHelper.x, 1, pHelper.y), getVertex(pTemp.x, 1, pTemp.y))
          pHelper = pTemp
        }
      }

      level.indexBufferOffset = indexBufferOffset
      level.indexBufferLength = indices.length - indexBufferOffset
    }

    return {
      vertices: new Float32Array(vertices),
      colors: new Float32Array(colors),
      indices: new Uint16Array(indices)
    }
  }

  const built = build()

  // Create and store data into vertex buffer
  const vertex_buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer)
  gl.bufferData(gl.ARRAY_BUFFER, built.vertices, gl.STATIC_DRAW)

  // Create and store data into color buffer
  const color_buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer)
  gl.bufferData(gl.ARRAY_BUFFER, built.colors, gl.STATIC_DRAW)

  // Create and store data into index buffer
  const index_buffer = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, built.indices, gl.STATIC_DRAW)

  const canvasWidth = canvas.clientWidth
  const canvasHeight = canvas.clientHeight

  let playerRotX = 0
  let playerRotY = 0
  const playerPos = [0, -1, 2]
  const viewMatrix = new Float32Array(16)
  const projectionMatrix = new Float32Array(16)
  calcProjectionMatrix()

  const vertShader = gl.createShader(gl.VERTEX_SHADER)
  gl.shaderSource(vertShader, shader_basic_vert)

  const fragShader = gl.createShader(gl.FRAGMENT_SHADER)
  gl.shaderSource(fragShader, shader_basic_frag)

  gl.compileShader(fragShader)
  gl.compileShader(vertShader)

  const shaderProgram = gl.createProgram()
  gl.attachShader(shaderProgram, vertShader)
  gl.attachShader(shaderProgram, fragShader)
  gl.linkProgram(shaderProgram)

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(shaderProgram))
  }

  /* ====== Associating attributes to vertex shader =====*/
  const Pmatrix = gl.getUniformLocation(shaderProgram, 'Pmatrix')
  const Vmatrix = gl.getUniformLocation(shaderProgram, 'Vmatrix')
  const position = gl.getAttribLocation(shaderProgram, 'position')
  const color = gl.getAttribLocation(shaderProgram, 'color')

  const cubeRenderer = makeCubeRenderer(gl, position, color)

  this.scale = 1.5

  this.accumulator = 0

  const interpolate = (position, movementVector) => {
    return position.sub(movementVector.mul(1 - Settings.tps * this.accumulator))
  }

  this.setCamera = (position, movementVector) => {
    const camera = interpolate(position, movementVector)
    playerPos[0] = -camera.x * scale
    playerPos[2] = camera.y * scale
    // TODO - update view matrix
  }

  this.bg = () => {
    calcViewMatrix()

    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)
    gl.clearColor(0.5, 0.5, 0.5, 0.9)
    gl.clearDepth(1.0)

    gl.viewport(0.0, 0.0, canvasWidth, canvasHeight)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  }

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

  this.level = level => {
    gl.useProgram(shaderProgram)

    gl.uniformMatrix4fv(Pmatrix, false, projectionMatrix)
    gl.uniformMatrix4fv(Vmatrix, false, viewMatrix)
    cubeRenderer()

    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer)
    gl.vertexAttribPointer(position, 3, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(position)

    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer)
    gl.vertexAttribPointer(color, 3, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(color)

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer)

    gl.drawElements(gl.TRIANGLES, level.indexBufferLength, gl.UNSIGNED_SHORT, level.indexBufferOffset * 2)
  }

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
