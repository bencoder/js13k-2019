const shader_basic_vert = `
uniform mat4 Pmatrix;
uniform mat4 Vmatrix;
uniform vec3 playerLightPosition;

attribute vec3 position;
attribute vec3 normal;
attribute vec2 texcoords;

varying highp vec2 vTexcoords;
varying highp vec3 vNormal;
varying highp vec3 vLight;
varying highp vec3 vSurfaceToPlayerLight;

void main(void) {
  vec3 ambientLight = vec3(0.3, 0.3, 0.3);
  highp vec3 directionalLightColor = vec3(1, 1, 1);
  highp vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));

  highp float directional = max(dot(normal, directionalVector), 0.0);

  gl_Position = Pmatrix * Vmatrix * vec4(position, 1.);
  vLight = ambientLight + (directionalLightColor * directional);
  vSurfaceToPlayerLight = position - playerLightPosition;
  vNormal = normal;
  vTexcoords = texcoords;
}
`

const shader_basic_frag = `
precision mediump float;
uniform sampler2D u_texture;
varying highp vec2 vTexcoords;
varying highp vec3 vNormal;
varying highp vec3 vLight;
varying highp vec3 vSurfaceToPlayerLight;
void main(void) {
  highp vec4 texelColor = texture2D(u_texture, vTexcoords);

  vec3 normal = normalize(vNormal);
  vec3 surfaceToLightDirection = normalize(vSurfaceToPlayerLight);

  float playerLight = 2. * dot(normal, surfaceToLightDirection);

  vec3 light = mix(vLight.xyz, vec3(playerLight, playerLight, playerLight), 0.9);

  gl_FragColor = vec4(texelColor.rgb * light, texelColor.a);;
}
`
