const Drawing = function(canvas) {
  const gl = canvas.getContext('webgl')
  const Telement = document.getElementById('T')

  //const textures = getTextures(gl)

  const scale = 1 / 100
  const pallette = [
    [0, 0, 0],
    [77, 238, 234],
    [116, 238, 21],
    [255, 231, 0],
    [255, 231, 0],
    [0, 30, 255],
    [255, 0, 0],
    [255, 0, 255]
  ].map(c => c.map(v => v / 255))

  function build() {
    const vertices = []
    const normals = []
    const colors = []
    const indices = []

    const topNormal = [0, 1, 0]

    const vertexMap = new Map()
    const getVertex = (xyz, color, normal = topNormal) => {
      const key = JSON.stringify([xyz, color, normal])
      let result = vertexMap.get(key)
      if (result === undefined) {
        result = vertexMap.size
        vertexMap.set(key, result)
        vertices.push(-xyz[0] * scale, xyz[1] * scale, xyz[2] * scale)
        colors.push(color[0], color[1], color[2])
        normals.push(normal[0], normal[1], normal[2])
      }
      return result
    }

    const makeTriangle = (v0, v1, v2, c) => {
      const U = Vec3.sub(v1, v0)
      const V = Vec3.sub(v2, v0)
      const normal = Vec3.cross(U, V)
      indices.push(getVertex(v0, c, normal), getVertex(v1, c, normal), getVertex(v2, c, normal))
    }
    const makeQuad2 = (v0, v1, v2, v3, c) => {
      makeTriangle(v0, v1, v3, c)
      makeTriangle(v1, v2, v3, c)
    }

    //b and t are each 4 vertexes, anticlockwise (when looking from above) for bottom and top of the shape
    const makeFrustrum = (b, t, c, c2) => {
      const offset = indices.length
      //makeQuad2(...b, c)
      makeQuad2(...t, c)
      makeQuad2(b[0], b[1], t[1], t[0], c2 || c)
      makeQuad2(b[0], t[0], t[3], b[3], c2 || c)
      makeQuad2(b[3], t[3], t[2], b[2], c2 || c)
      makeQuad2(b[2], t[2], t[1], b[1], c2 || c)
      const length = indices.length - offset
      return [offset, length]
    }

    for (const level of levels) {
      const indexBufferOffset = indices.length

      const walls = level.walls
      for (const poly of walls) {
        let perimeter0 = 0
        for (let i = 0; i < poly.length; ++i) {
          const poly0 = poly[i]
          const poly1 = poly[(i + 1) % poly.length]

          const a = new Vec2(poly0.x, poly0.y)
          const b = new Vec2(poly1.x, poly1.y)

          const segmentLength = Math.hypot(b.x - a.x, b.y - a.y)
          if (segmentLength === 0) {
            continue
          }

          const xlen = a.x - b.x
          const zlen = a.y - b.y

          const nx = -zlen / segmentLength
          const nz = xlen / segmentLength

          const perimeter1 = perimeter0 + segmentLength

          const verticalNormal = [-nx, 0, nz]
          const invVerticalNormal = [nx, 0, -nz]

          const width = 5
          const topY = -10
          const bottomY = 1
          const deepdown = 1000

          // deep down
          makeQuad2([a.x, deepdown, a.y], [b.x, deepdown, b.y], [b.x, bottomY, b.y], [a.x, bottomY, a.y], pallette[7])

          const offset = new Vec2(nx, nz).mul(width / 2)
          const border = [a.sub(offset), b.sub(offset), b.add(offset), a.add(offset)]
          makeFrustrum(
            [
              [border[0].x, bottomY, border[0].y],
              [border[1].x, bottomY, border[1].y],
              [border[2].x, bottomY, border[2].y],
              [border[3].x, bottomY, border[3].y]
            ],
            [
              [border[0].x, topY, border[0].y],
              [border[1].x, topY, border[1].y],
              [border[2].x, topY, border[2].y],
              [border[3].x, topY, border[3].y]
            ],
            pallette[5]
          )

          const pillarBorder = [
            a.add({ x: 7, y: 7 }), //front-right
            a.add({ x: 7, y: -7 }), //back-right
            a.add({ x: -7, y: -7 }), //back-left
            a.add({ x: -7, y: 7 }) //front-left
          ]
          makeFrustrum(
            [
              [pillarBorder[0].x, deepdown, pillarBorder[0].y],
              [pillarBorder[1].x, deepdown, pillarBorder[1].y],
              [pillarBorder[2].x, deepdown, pillarBorder[2].y],
              [pillarBorder[3].x, deepdown, pillarBorder[3].y]
            ],
            [
              [pillarBorder[0].x, topY - 1, pillarBorder[0].y],
              [pillarBorder[1].x, topY - 1, pillarBorder[1].y],
              [pillarBorder[2].x, topY - 1, pillarBorder[2].y],
              [pillarBorder[3].x, topY - 1, pillarBorder[3].y]
            ],
            pallette[2]
          )

          perimeter0 = perimeter1
        }
      }

      for (const pts of level.polys) {
        const a = pts[0]
        let b = pts[1]
        for (let i = 2; i < pts.length; ++i) {
          const c = pts[i]
          indices.push(
            getVertex([a.x, 1, a.y], pallette[4]),
            getVertex([b.x, 1, b.y], pallette[4]),
            getVertex([c.x, 1, c.y], pallette[4])
          )
          b = c
        }
      }

      level.indexBufferOffset = indexBufferOffset
      level.indexBufferLength = indices.length - indexBufferOffset

      const switchSize = 25
      const switchTop = -2
      for (const s of level.switches) {
        const p = new Vec2(s.x, s.y)
        const bottom = [
          [s.x + switchSize, 1, s.y + switchSize],
          [s.x + switchSize, 1, s.y - switchSize],
          [s.x - switchSize, 1, s.y - switchSize],
          [s.x - switchSize, 1, s.y + switchSize]
        ]
        const top = [
          [s.x + switchSize, switchTop, s.y + switchSize],
          [s.x + switchSize, switchTop, s.y - switchSize],
          [s.x - switchSize, switchTop, s.y - switchSize],
          [s.x - switchSize, switchTop, s.y + switchSize]
        ]
        const [o, l] = makeFrustrum(bottom, top, pallette[5], pallette[0])
        s.indexBufferOffset = o
        s.indexBufferLength = l
      }

      for (const d of level.doors) {
        const p = d.polygon
        const p0 = new Vec2(p[0].x, p[0].y)
        const p1 = new Vec2(p[1].x, p[1].y)
        const normal = p1.sub(p0).normal()
        const offset = normal.mul(1)
        const border = [p0.sub(offset), p1.sub(offset), p1.add(offset), p0.add(offset)]
        const bottomY = -4
        const topY = -6
        const [o, l] = makeFrustrum(
          [
            [border[0].x, bottomY, border[0].y],
            [border[1].x, bottomY, border[1].y],
            [border[2].x, bottomY, border[2].y],
            [border[3].x, bottomY, border[3].y]
          ],
          [
            [border[0].x, topY, border[0].y],
            [border[1].x, topY, border[1].y],
            [border[2].x, topY, border[2].y],
            [border[3].x, topY, border[3].y]
          ],
          pallette[6]
        )
        d.indexBufferOffset = o
        d.indexBufferLength = l
      }
    }

    return {
      vertices: new Float32Array(vertices),
      normals: new Float32Array(normals),
      colors: new Float32Array(colors),
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
  const colors_buffer = createGlBuffer(built.colors)
  const index_buffer = createGlBuffer(built.indices, gl.ELEMENT_ARRAY_BUFFER)

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
      console.log('Shader compilation failed: ' + gl.getShaderInfoLog(shader))
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

  this.scale = 1.5

  this.accumulator = 0

  const interpolate = (position, movementVector) => {
    return position.sub(movementVector.mul(1 - Settings.tps * this.accumulator))
  }

  this.setCamera = (position, movementVector) => {
    const camera = interpolate(position, movementVector)

    playerLightPosition[0] = -camera.x * scale
    playerLightPosition[2] = camera.y * scale

    cameraPos[0] = -camera.x * scale
    cameraPos[1] = -1 - this.scale
    cameraPos[2] = 1 + camera.y * scale
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
    //gl.bindTexture(gl.TEXTURE_2D, textures.t1)

    gl.enable(gl.CULL_FACE)
    gl.cullFace(gl.BACK)

    gl.useProgram(shaderProgram)

    gl.uniformMatrix4fv(uPmatrix, false, projectionMatrix)
    gl.uniformMatrix4fv(uVmatrix, false, viewMatrix)
    gl.uniform3fv(uPlayerLightPosition, playerLightPosition)

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

    gl.drawElements(gl.TRIANGLES, level.indexBufferLength, gl.UNSIGNED_SHORT, level.indexBufferOffset * 2)

    for (s of level.switches) {
      if (s.pressed) {
        mat4.translate(viewMatrix, viewMatrix, [0, 2 * scale, 0])
        gl.uniformMatrix4fv(uVmatrix, false, viewMatrix)
      }
      gl.drawElements(gl.TRIANGLES, s.indexBufferLength, gl.UNSIGNED_SHORT, s.indexBufferOffset * 2)
      if (s.pressed) {
        mat4.translate(viewMatrix, viewMatrix, [0, -2 * scale, 0])
        gl.uniformMatrix4fv(uVmatrix, false, viewMatrix)
      }
    }
    for (d of level.doors) {
      if (d.open) continue
      gl.drawElements(gl.TRIANGLES, d.indexBufferLength, gl.UNSIGNED_SHORT, d.indexBufferOffset * 2)
    }
  }

  this.titleScreen = () => {}

  this.endScreen = () => {}

  function calcViewMatrix(out = viewMatrix) {
    mat4.identity(out)
    mat4.rotateX(out, out, cameraRotX)
    mat4.rotateY(out, out, cameraRotY)
    mat4.rotateZ(out, out, -Math.PI)
    mat4.translate(out, out, [-cameraPos[0], -cameraPos[1], -cameraPos[2]])
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
        cameraRotY += (e.movementX || 0) * camRotSpeed
        if (cameraRotY < 0) {
          cameraRotY += Math.PI * 2
        }
        if (cameraRotY >= Math.PI * 2) {
          cameraRotY -= Math.PI * 2
        }
        cameraRotX += (e.movementY || 0) * camRotSpeed
        if (cameraRotX < -Math.PI * 0.5) {
          cameraRotX = -Math.PI * 0.5
        }
        if (cameraRotX > Math.PI * 0.5) {
          cameraRotX = Math.PI * 0.5
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
