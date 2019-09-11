const shader_basic_vert = `
uniform mat4 Pmatrix;
uniform mat4 Vmatrix;
uniform highp vec3 playerLightPosition;
uniform vec3 inTranslation;
uniform vec3 inAmbientColor;

attribute vec3 position;
attribute vec3 normal;
attribute vec3 color;

varying highp vec3 vColor;
varying highp vec3 vNormal;
varying highp vec3 vPosition;

void main(void) {
  vec3 wp = position + inTranslation;
  gl_Position = Pmatrix * Vmatrix * vec4(wp, 1.);
  vPosition = wp;
  vNormal = normal;
  vColor = color * inAmbientColor;
}
`

const shader_basic_frag = `
precision mediump float;
uniform highp vec3 playerLightPosition;
uniform float inSurfaceSensitivity;
varying highp vec3 vColor;
varying highp vec3 vNormal;
varying highp vec3 vPosition;

const vec3 AMBIENT_LIGHT = vec3(0.2, 0.2, 0.3);
const vec3 PLAYER_LIGHT_COLOR = vec3(0., 1., 1.);

void main(void) {

  vec3 normal = normalize(vNormal);

  vec3 surfaceToLightDirection = normalize(vPosition - vec3(playerLightPosition.x, -1., playerLightPosition.z));
  float directional = max(dot(normal, surfaceToLightDirection), 0.0);

  float distanceToPlayer2D = distance(vPosition.xz, playerLightPosition.xz);
  float spotLight = max(0.3 - vPosition.y, 0.) * max(0., 1. - distanceToPlayer2D * 1.1);

  vec3 light = vColor * (AMBIENT_LIGHT + vec3(mix(1., directional + spotLight, inSurfaceSensitivity)))
    + vec3(4.5 * spotLight * spotLight * inSurfaceSensitivity);

  float fog = 1. - smoothstep(0.1, 10., vPosition.y);
  gl_FragColor = vec4(light * fog, 1.);;
}
`
