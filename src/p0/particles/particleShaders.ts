export const particleVertexShader = `
attribute vec3 aStartPosition;
attribute vec3 aTargetPosition;
attribute float aDelay;
attribute float aRandom;

uniform float uProgress;
uniform float uTime;
uniform float uOpacity;
uniform float uPointSize;
uniform float uPixelRatio;

varying float vAlpha;
varying float vRandom;

float easeInOut(float t) {
  return t * t * (3.0 - 2.0 * t);
}

float easeOut(float t) {
  return 1.0 - pow(1.0 - t, 2.2);
}

void main() {
  float localProgress = clamp((uProgress - aDelay) / max(0.0001, 1.0 - aDelay), 0.0, 1.0);
  float easedLocalProgress = mix(easeOut(localProgress), easeInOut(localProgress), 0.35);
  float noiseFade = 1.0 - easedLocalProgress;
  float angle = aRandom * 6.28318530718 + uTime * 0.55;
  vec3 swirl = vec3(cos(angle), sin(angle * 0.7), sin(angle)) * noiseFade * 0.045;
  vec3 basePosition = mix(aStartPosition, aTargetPosition, easedLocalProgress) + swirl;

  vec4 mvPosition = modelViewMatrix * vec4(basePosition, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = uPointSize * uPixelRatio * (7.0 / max(2.0, -mvPosition.z));

  vAlpha = uOpacity * smoothstep(0.01, 0.18, localProgress);
  vRandom = aRandom;
}
`;

export const particleFragmentShader = `
precision highp float;

uniform vec3 uColor;

varying float vAlpha;
varying float vRandom;

void main() {
  vec2 center = gl_PointCoord - vec2(0.5);
  float distanceToCenter = length(center);
  if (distanceToCenter > 0.5) discard;

  float edge = smoothstep(0.5, 0.22, distanceToCenter);
  float brightness = 0.92 + vRandom * 0.16;
  gl_FragColor = vec4(uColor * brightness, edge * vAlpha);
}
`;
