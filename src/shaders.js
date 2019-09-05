const shader_basic_vert = `
attribute vec3 position;
uniform mat4 Pmatrix;
uniform mat4 Vmatrix;

attribute vec3 color;
varying vec3 vColor;
varying vec3 vPosition;

void main(void) {
  gl_Position = Pmatrix * Vmatrix * vec4(position, 1.);
  vColor = color;
  vPosition = position;
}
`

const shader_basic_frag = `
precision mediump float;
varying vec3 vPosition;
varying vec3 vColor;
void main(void) {
  gl_FragColor = vec4(vColor, 1.);
}
`
