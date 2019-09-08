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
  highp vec3 directionalLightColor = vec3(1, 1, 1);
  highp vec3 directionalVector = normalize(vec3(0.5, 0.5, 0.5));

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

void main(void) {

  vec3 normal = normalize(vNormal);

  vec3 surfaceToLightDirection = normalize(vPosition - vec3(playerLightPosition.x, -1., playerLightPosition.z));
  float directional = max(dot(normal, surfaceToLightDirection), 0.0);

  float playerLight = 2.3 - 2. * distance(vPosition, vec3(playerLightPosition.x, 0., playerLightPosition.z));

  float totalLight = max(directional, playerLight);

  vec3 light = AMBIENT_LIGHT + vec3(totalLight);

  float fog = 1. - smoothstep(0.1,10.,vPosition.y);
  gl_FragColor = vec4(vColor * light * fog, 1.);;
}
`
