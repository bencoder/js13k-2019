const shader_basic_vert = `
uniform mat4 Pmatrix;
uniform mat4 Vmatrix;

attribute vec3 position;
attribute vec3 normal;
attribute vec2 texcoords;

varying highp vec2 vTexcoords;
varying highp vec3 vLight;

void main(void) {
  highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
  highp vec3 directionalLightColor = vec3(1, 1, 1);
  highp vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));

  highp float directional = max(dot(normal, directionalVector), 0.0);

  gl_Position = Pmatrix * Vmatrix * vec4(position, 1.);
  vLight = ambientLight + (directionalLightColor * directional);
  vTexcoords = texcoords;
}
`

const shader_basic_frag = `
precision mediump float;
uniform sampler2D u_texture;
varying highp vec2 vTexcoords;
varying highp vec3 vLight;
void main(void) {
  highp vec4 texelColor = texture2D(u_texture, vTexcoords);
  gl_FragColor = vec4(texelColor.rgb * vLight, texelColor.a);;
}
`
