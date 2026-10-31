import React, {useMemo} from 'react';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {SNOISE} from './glsl';

export const sunVS = /* glsl */ `
varying vec3 vN; varying vec3 vP; varying vec3 vView;
void main(){ vN=normalize(normalMatrix*normal); vP=position; vec4 mv=modelViewMatrix*vec4(position,1.); vView=normalize(-mv.xyz); gl_Position=projectionMatrix*mv; }`;
export const sunFS = /* glsl */ `
uniform float uTime; uniform float uHeat; uniform float uOpacity;
varying vec3 vN; varying vec3 vP; varying vec3 vView;
${SNOISE}
void main(){
  vec3 p = normalize(vP);
  // granulation: cells with dark intergranular lanes
  float g1 = snoise(p*64.0 + vec3(0., uTime*0.08, uTime*0.05));
  float g2 = snoise(p*150.0 - vec3(uTime*0.12, 0., uTime*0.1));
  float gran = 1.0 - pow(abs(g1*0.75 + g2*0.25), 0.35);
  // supergranulation + active regions
  float big = fbm(p*4.0 + vec3(uTime*0.02));
  float spots = smoothstep(0.62, 0.78, fbm(p*2.2 + 11.3));
  float mu = clamp(dot(normalize(vN), normalize(vView)), 0.0, 1.0);
  float limb = pow(mu, 0.9);               // strong limb darkening (real photosphere)
  float t = clamp(0.25 + 0.45*gran + 0.35*big, 0.0, 1.2);
  t *= 1.0 - spots*0.8;
  vec3 deep = vec3(0.35, 0.04, 0.0);
  vec3 red = vec3(0.85, 0.16, 0.01);
  vec3 orange = vec3(1.0, 0.42, 0.05);
  vec3 gold = vec3(1.0, 0.68, 0.22);
  vec3 col = mix(deep, red, smoothstep(0.0, 0.3, t));
  col = mix(col, orange, smoothstep(0.3, 0.65, t));
  col = mix(col, gold, smoothstep(0.7, 1.05, t));
  col *= mix(0.25, 1.0, limb);
  col = mix(col, vec3(0.6,0.08,0.0)*0.5, (1.0-limb)*0.5);
  col += vec3(1.0,0.5,0.1) * smoothstep(0.55,0.9,big) * pow(1.0-mu,2.0) * 0.5;
  col *= 1.15*mix(0.45,1.0,limb);
  col += vec3(1.0,0.55,0.2)*pow(mu,6.0)*0.12;
  gl_FragColor = vec4(col * (1.0 + uHeat*1.6), uOpacity);
}`;

export const coronaFS = /* glsl */ `
uniform float uTime; uniform float uOpacity; uniform float uR; varying vec2 vUv;
${SNOISE}
void main(){
  vec2 c = vUv*2.0-1.0; float d = length(c); float a = atan(c.y, c.x);
  float rays = 0.55 + 0.45*snoise(vec3(cos(a)*3.0, sin(a)*3.0, uTime*0.15 + d*1.5));
  rays *= 0.6 + 0.4*snoise(vec3(cos(a)*9.0, sin(a)*9.0, uTime*0.2));
  float x = max(0.0, d - uR);
  float glow = exp(-x*8.0)*0.35 + exp(-x*2.6)*0.18*rays + exp(-x*30.0)*0.35;
  glow *= smoothstep(uR*0.92, uR*1.0, d);
  vec3 col = mix(vec3(0.9,0.22,0.02), vec3(1.0,0.5,0.12), exp(-x*14.0));
  gl_FragColor = vec4(col*glow*1.1*uOpacity, glow*uOpacity);
}`;

export const Sun: React.FC<{position: [number, number, number]; radius: number; scale: number; time: number; heat: number; opacity?: number}> = ({position, radius, scale, time, heat, opacity = 1}) => {
  const camera = useThree((s) => s.camera);
  const mat = useMemo(() => new THREE.ShaderMaterial({uniforms: {uTime: {value: 0}, uHeat: {value: 0}, uOpacity: {value: 1}}, vertexShader: sunVS, fragmentShader: sunFS, transparent: true}), []);
  const cor = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {uTime: {value: 0}, uOpacity: {value: 1}, uR: {value: 0.33}}, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`, fragmentShader: coronaFS,
  }), []);
  mat.uniforms.uTime.value = time; mat.uniforms.uHeat.value = heat; mat.uniforms.uOpacity.value = opacity;
  cor.uniforms.uTime.value = time; cor.uniforms.uOpacity.value = opacity;
  const q = camera.quaternion.clone();
  return (
    <group position={position} scale={scale}>
      <mesh material={mat} rotation={[0.3, time * 0.02, 0.1]}><sphereGeometry args={[radius, 160, 160]} /></mesh>
      <mesh material={cor} quaternion={q} renderOrder={-1}><planeGeometry args={[radius * 6, radius * 6]} /></mesh>
    </group>
  );
};
