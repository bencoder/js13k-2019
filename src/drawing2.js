const Drawing = function(canvas) {
  const gl = canvas.getContext('webgl')
  const Telement = document.getElementById('T')

  const textures = getTextures(gl)

  const scale = 1 / 100

  function build() {
    const vertices = []
    const normals = []
    const texcoords = []
    const indices = []

    const vertexMap = new Map()
    const getVertex = (v, t, n = [0, 1, 0]) => {
      const key = JSON.stringify([v, t, n])
      let result = vertexMap.get(key)
      if (result === undefined) {
        result = vertexMap.size
        vertexMap.set(key, result)
        vertices.push(-v[0] * scale, v[1] * scale, v[2] * scale)
        texcoords.push(t[0] * scale * 4, t[1] * scale * 4)
        normals.push(n[0], n[1], n[2])
      }
      return result
    }

    const getTriangleNormal = (v0, v1, v2) => {
      const ux = v1[0] - v0[0]
      const uy = v1[1] - v0[1]
      const uz = v1[2] - v0[2]

      const vx = v2[0] - v0[0]
      const vy = v2[1] - v0[1]
      const vz = v2[2] - v0[2]

      const nx = uy * vz - uz * vy
      const ny = uz * vx - ux * vz
      const nz = ux * vy - uy * vx

      const len2 = nx * nx + ny * ny + nz * nz
      if (len2 <= 0.00000001) {
        return [0, 1, 0]
      }

      const len = 1 / Math.sqrt(len2)
      return [nx * len, ny * len, nz * len]
    }

    const makeWallQuad = (aX, aY, aZ, bX, bY, bZ, tshift, segmentLength) => {
      const h = bY - aY
      const p0 = getVertex([aX, aY, aZ], [tshift, 0])
      const p1 = getVertex([bX, aY, bZ], [tshift + segmentLength, 0])
      const p2 = getVertex([aX, bY, aZ], [tshift, h])
      const p3 = getVertex([bX, bY, bZ], [tshift + segmentLength, h])
      indices.push(p0, p3, p1, p0, p2, p3)
    }

    const makeFloorQuad = (aX, aY, aZ, bX, bY, bZ) => {
      const p0 = getVertex([aX, aY, aZ], [aX, aZ])
      const p1 = getVertex([aX, bY, bZ], [aX, bZ])
      const p2 = getVertex([bX, aY, aZ], [bX, aZ])
      const p3 = getVertex([bX, bY, bZ], [bX, bZ])
      indices.push(p0, p3, p1, p0, p2, p3)
    }

    const makeQuad = (v0, v1, v2, v3) => {
      const n = getTriangleNormal(v0[0], v3[0], v1[0])
      const i0 = getVertex(...v0, n)
      const i1 = getVertex(...v1, n)
      const i2 = getVertex(...v2, n)
      const i3 = getVertex(...v3, n)
      indices.push(i0, i3, i1, i0, i2, i3)
    }

    for (const level of levels) {
      const indexBufferOffset = indices.length

      const walls = level.walls
      for (const poly of walls) {
        let perimeter0 = 0
        for (let i = 0; i < poly.length; ++i) {
          const a = new Vec2(poly[i].x, poly[i].y)
          const bb = poly[(i + 1) % poly.length]
          const b = new Vec2(bb.x, bb.y)

          //polyWallPerimeter += makeWallQuad(a.x, 1, a.y, b.x, 100, b.y, 3, polyWallPerimeter)

          const width = 5
          const topY = -10
          const pillarY = -15
          const bottomY = 1
          const deepdown = 100

          const segmentLength = Math.hypot(b.x - a.x, b.y - a.y)
          const perimeter1 = perimeter0 + segmentLength

          const height = bottomY - topY

          // deep down
          makeQuad(
            [[a.x, bottomY, a.y], [perimeter0, bottomY]],
            [[b.x, bottomY, b.y], [perimeter1, bottomY]],
            [[a.x, deepdown, a.y], [perimeter0, deepdown]],
            [[b.x, deepdown, b.y], [perimeter1, deepdown]]
          )

          const offset = a
            .sub(b)
            .normal()
            .mul(width / 2)

          const border = [a.add(offset), b.add(offset), b.sub(offset), a.sub(offset)]

          // outer
          makeQuad(
            [[border[1].x, bottomY, border[1].y], [perimeter0, bottomY]],
            [[border[0].x, bottomY, border[0].y], [perimeter1, bottomY]],
            [[border[1].x, topY, border[1].y], [perimeter0, topY]],
            [[border[0].x, topY, border[0].y], [perimeter1, topY]]
          )

          // inner
          makeQuad(
            [[border[3].x, bottomY, border[3].y], [perimeter0, bottomY]],
            [[border[2].x, bottomY, border[2].y], [perimeter1, bottomY]],
            [[border[3].x, topY, border[3].y], [perimeter0, topY]],
            [[border[2].x, topY, border[2].y], [perimeter1, topY]]
          )

          // top
          makeQuad(
            [[border[0].x, topY, border[0].y], [border[0].x, border[0].y]],
            [[border[1].x, topY, border[1].y], [border[1].x, border[1].y]],
            [[border[3].x, topY, border[3].y], [border[3].x, border[3].y]],
            [[border[2].x, topY, border[2].y], [border[2].x, border[2].y]]
          )
          /*
          makeQuad(
            [[quad[0].x, topY, quad[0].y], [quad[0].x, quad[0].y]],
            [[quad[1].x, topY, quad[1].y], [quad[1].x, quad[1].y]],
            [[quad[3].x, topY, quad[3].y], [quad[3].x, quad[3].y]],
            [[quad[2].x, topY, quad[2].y], [quad[2].x, quad[2].y]]
          )
          */

          /*
          const quad2 = [
            a.add({ x: 7, y: 7 }), //front-right
            a.add({ x: 7, y: -7 }), //back-right
            a.add({ x: -7, y: -7 }), //back-left
            a.add({ x: -7, y: 7 }) //front-left
          ]
          makeWallQuad(quad2[0].x, deepdown, quad2[0].y, quad2[3].x, pillarY, quad2[3].y, 2) //front
          makeWallQuad(quad2[2].x, deepdown, quad2[2].y, quad2[3].x, pillarY, quad2[3].y, 2) //left
          makeFloorQuad(quad2[3].x, pillarY, quad2[3].y, quad2[1].x, pillarY, quad2[1].y, 1) //top
          makeWallQuad(quad2[0].x, deepdown, quad2[0].y, quad2[1].x, pillarY, quad2[1].y, 2) //right
          makeWallQuad(quad2[1].x, deepdown, quad2[1].y, quad2[2].x, pillarY, quad2[2].y, 2) //back
          */
          perimeter0 = perimeter1
        }
      }

      for (const pts of level.polys) {
        const a = pts[0]
        let b = pts[1]
        for (let i = 2; i < pts.length; ++i) {
          const c = pts[i]
          indices.push(
            getVertex([a.x, 1, a.y], [a.x, a.y]),
            getVertex([b.x, 1, b.y], [b.x, b.y]),
            getVertex([c.x, 1, c.y], [c.x, c.y])
          )
          b = c
        }
      }

      level.indexBufferOffset = indexBufferOffset
      level.indexBufferLength = indices.length - indexBufferOffset
    }

    return {
      vertices: new Float32Array(vertices),
      normals: new Float32Array(normals),
      texcoords: new Float32Array(texcoords),
      indices: new Uint16Array(indices)
    }
  }

  const built = build()

  const createGlBuffer = (items, type = gl.ARRAY_BUFFER) => {
    const result = gl.createBuffer()
    gl.bindBuffer(type, result)
    gl.bufferData(type, items, gl.STATIC_DRAW)
    return result
  }

  const vertex_buffer = createGlBuffer(built.vertices)
  const normal_buffer = createGlBuffer(built.normals)
  const texcoords_buffer = createGlBuffer(built.texcoords)
  const index_buffer = createGlBuffer(built.indices, gl.ELEMENT_ARRAY_BUFFER)

  const canvasWidth = canvas.clientWidth
  const canvasHeight = canvas.clientHeight

  let playerRotX = 0
  let playerRotY = 0
  const playerPos = [0, -1, 2]
  const viewMatrix = new Float32Array(16)
  const projectionMatrix = new Float32Array(16)
  calcProjectionMatrix()

  const createGlShasder = (program, input, type) => {
    const shader = gl.createShader(type)
    gl.shaderSource(shader, input)
    gl.compileShader(shader)
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
  const Pmatrix = gl.getUniformLocation(shaderProgram, 'Pmatrix')
  const Vmatrix = gl.getUniformLocation(shaderProgram, 'Vmatrix')
  const position = gl.getAttribLocation(shaderProgram, 'position')
  const normal = gl.getAttribLocation(shaderProgram, 'normal')
  const texcoords = gl.getAttribLocation(shaderProgram, 'texcoords')

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
    gl.clearColor(0.5, 0.5, 0.5, 1)
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
    gl.bindTexture(gl.TEXTURE_2D, textures.t1)

    gl.useProgram(shaderProgram)

    gl.uniformMatrix4fv(Pmatrix, false, projectionMatrix)
    gl.uniformMatrix4fv(Vmatrix, false, viewMatrix)

    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer)
    gl.vertexAttribPointer(position, 3, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(position)

    gl.bindBuffer(gl.ARRAY_BUFFER, normal_buffer)
    gl.vertexAttribPointer(normal, 3, gl.FLOAT, true, 0, 0)
    gl.enableVertexAttribArray(normal)

    gl.bindBuffer(gl.ARRAY_BUFFER, texcoords_buffer)
    gl.vertexAttribPointer(texcoords, 2, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(texcoords)

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
