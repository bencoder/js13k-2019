const shader_basic_vert = `
uniform mat4 Pmatrix;
uniform mat4 Vmatrix;
uniform highp vec3 playerLightPosition;
uniform vec3 inTranslation;
uniform vec3 inAmbientColor;
uniform highp float inFade;

attribute vec3 position;
attribute vec3 normal;
attribute vec3 color;

varying highp vec3 vColor;
varying highp vec3 vNormal;
varying highp vec3 vPosition;

void main(void) {
  vec3 wp = position + inTranslation;
  gl_Position = Pmatrix * Vmatrix * vec4(wp + vec3(0., 1.-inFade, 0.), 1.);
  vPosition = wp;
  vNormal = normal;
  vColor = color * inAmbientColor * inFade;
}
`

const shader_basic_frag = `
precision mediump float;
uniform highp vec3 playerLightPosition;
uniform float inSurfaceSensitivity;
uniform float inFrameTime;
varying highp vec3 vColor;
varying highp vec3 vNormal;
varying highp vec3 vPosition;

const vec3 AMBIENT_LIGHT = vec3(0.2, 0.2, 0.3);
const vec3 PLAYER_LIGHT_COLOR = vec3(0., 1., 1.);
const vec2 s = vec2(1, 1.7320508);
vec4 getHex(vec2 p){
  vec4 hC = floor(vec4(p, p - vec2(.5, 1))/s.xyxy) + .5;
  vec4 h = vec4(p - hC.xy*s, p - (hC.zw + .5)*s);
  return dot(h.xy, h.xy)<dot(h.zw, h.zw) ? vec4(h.xy, hC.xy) : vec4(h.zw, hC.zw + 9.43);
}

float hash21(vec2 p){ return fract(sin(dot(p, vec2(141.173, 289.927)))*43758.5453); }

float hex(vec2 p) {
  vec4 h = getHex(p);
  return sin(hash21(h.zw)*8. + inFrameTime) * 0.5 + 0.5;
}


void main(void) {

  vec3 normal = normalize(vNormal);

  vec3 surfaceToLightDirection = normalize(vPosition - vec3(playerLightPosition.x, -1., playerLightPosition.z));
  float directional = max(dot(normal, surfaceToLightDirection), 0.0);

  float distanceToPlayer2D = distance(vPosition.xz, playerLightPosition.xz);
  float spotLight = max(0.3 - vPosition.y, 0.) * max(0., 1. - distanceToPlayer2D * 1.1);

  vec3 light = vColor * (AMBIENT_LIGHT + vec3(mix(1., directional + spotLight, inSurfaceSensitivity)))
    + vec3(4.5 * spotLight * spotLight * inSurfaceSensitivity);

  if (normal.y > 0.95 && normal.y < 1.05 && vPosition.y  > 0.) {
    light *= mix(0.6, 0.8, 1.-hex(vPosition.xz*5.));
  }

  float fog = 1. - smoothstep(0.1, 10., vPosition.y);
  gl_FragColor = vec4(light * fog, 1.);;
}
`
