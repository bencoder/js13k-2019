const mat4Identity = new Float32Array(16)
mat4Identity[0] = 1
mat4Identity[5] = 1
mat4Identity[10] = 1
mat4Identity[15] = 1

const mat4RotateX = (a, radX) => {
  const s = sin(radX)
  const c = cos(radX)
  const a10 = a[4]
  const a11 = a[5]
  const a12 = a[6]
  const a13 = a[7]
  const a20 = a[8]
  const a21 = a[9]
  const a22 = a[10]
  const a23 = a[11]

  // Perform axis-specific matrix multiplication
  a[4] = a10 * c + a20 * s
  a[5] = a11 * c + a21 * s
  a[6] = a12 * c + a22 * s
  a[7] = a13 * c + a23 * s
  a[8] = a20 * c - a10 * s
  a[9] = a21 * c - a11 * s
  a[10] = a22 * c - a12 * s
  a[11] = a23 * c - a13 * s
}

const mat4RotateY = (a, radY) => {
  const sY = sin(radY)
  const cY = cos(radY)
  const a00 = a[0]
  const a01 = a[1]
  const a02 = a[2]
  const a03 = a[3]
  const a20 = a[8]
  const a21 = a[9]
  const a22 = a[10]
  const a23 = a[11]

  // Perform axis-specific matrix multiplication
  a[0] = a00 * cY - a20 * sY
  a[1] = a01 * cY - a21 * sY
  a[2] = a02 * cY - a22 * sY
  a[3] = a03 * cY - a23 * sY
  a[8] = a00 * sY + a20 * cY
  a[9] = a01 * sY + a21 * cY
  a[10] = a02 * sY + a22 * cY
  a[11] = a03 * sY + a23 * cY
}

const mat4RotateZ = (a, radZ) => {
  const sZ = sin(radZ)
  const cZ = cos(radZ)
  const a00 = a[0]
  const a01 = a[1]
  const a02 = a[2]
  const a03 = a[3]
  const a10 = a[4]
  const a11 = a[5]
  const a12 = a[6]
  const a13 = a[7]

  a[0] = a00 * cZ + a10 * sZ
  a[1] = a01 * cZ + a11 * sZ
  a[2] = a02 * cZ + a12 * sZ
  a[3] = a03 * cZ + a13 * sZ
  a[4] = a10 * cZ - a00 * sZ
  a[5] = a11 * cZ - a01 * sZ
  a[6] = a12 * cZ - a02 * sZ
  a[7] = a13 * cZ - a03 * sZ
}

const mat4Translate = (a, x, y, z) => {
  a[12] = a[0] * x + a[4] * y + a[8] * z + a[12]
  a[13] = a[1] * x + a[5] * y + a[9] * z + a[13]
  a[14] = a[2] * x + a[6] * y + a[10] * z + a[14]
  a[15] = a[3] * x + a[7] * y + a[11] * z + a[15]
}
