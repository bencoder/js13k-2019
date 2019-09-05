const shader_basic_vert = `
attribute vec3 position;
uniform mat4 Pmatrix;
uniform mat4 Vmatrix;

attribute vec2 texcoords;
varying vec2 vTexcoords;
varying vec3 vPosition;

void main(void) {
  gl_Position = Pmatrix * Vmatrix * vec4(position, 1.);
  vTexcoords = texcoords;
  vPosition = position;
}
`

const shader_basic_frag = `
precision mediump float;
uniform sampler2D u_texture;
varying vec3 vPosition;
varying vec2 vTexcoords;
void main(void) {
  gl_FragColor = texture2D(u_texture, vTexcoords);
}
`
