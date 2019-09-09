const shader_basic_vert = `
uniform mat4 Pmatrix;
uniform mat4 Vmatrix;
uniform highp vec3 playerLightPosition;

attribute vec3 position;
attribute vec3 normal;
attribute vec3 color;

varying highp vec3 vColor;
varying highp vec3 vNormal;
varying highp vec3 vPosition;

void main(void) {
  gl_Position = Pmatrix * Vmatrix * vec4(position, 1.);
  vPosition = position;
  vNormal = normal;
  vColor = color;
}
`

const shader_basic_frag = `
precision mediump float;
uniform highp vec3 playerLightPosition;
varying highp vec3 vColor;
varying highp vec3 vNormal;
varying highp vec3 vPosition;

const vec3 AMBIENT_LIGHT = vec3(0.2, 0.2, 0.3);
const vec3 PLAYER_LIGHT_COLOR = vec3(0., 1., 1.);

void main(void) {

  vec3 normal = normalize(vNormal);

  vec3 surfaceToLightDirection = normalize(vPosition - vec3(playerLightPosition.x, -1., playerLightPosition.z));
  float directional = max(dot(normal, surfaceToLightDirection), 0.0);

  float playerLight = 1. - distance(vPosition, vec3(playerLightPosition.x, 0., playerLightPosition.z));

  float totalLight = max(0.3 - vPosition.y, 0.) * max(0., playerLight);
  float totalLight2 = totalLight * totalLight;

  vec3 light = vColor * (AMBIENT_LIGHT + vec3(directional + totalLight))
    + vec3(5. * totalLight2);

  float fog = 1. - smoothstep(0.1,10.,vPosition.y);
  gl_FragColor = vec4(light * fog, 1.);;
}
`
