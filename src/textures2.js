function getTextures(gl) {
  function loadImageAndCreateTextureInfo(data) {
    const tex = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, tex)
    // Fill the texture with a 1x1 blue pixel.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]))

    // let's assume all images are not a power of 2
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)

    const img = new Image()
    img.addEventListener('load', () => {
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
    })
    img.src = `data:image/png;base64,${data}`

    return tex
  }

  const t1 = loadImageAndCreateTextureInfo(
    'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAgMAAABinRfyAAAACVBMVEVmXFF/c2ZMRT3dnBtFAAAAGElEQVQI12MQDQ0NZWhgYGCknFi1atUKAH7KCsnrs38dAAAAAElFTkSuQmCC'
  )

  return {
    t1
  }
}
