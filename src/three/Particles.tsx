import {Q} from '../quality';
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {random} from 'remotion';

/* Dense warm plasma bokeh around the camera — depth-sized soft discs, slow drift */
export const PlasmaDust: React.FC<{time: number; opacity: number; color?: string; count?: number}> = ({time, opacity, color = '#FF9A3C', count = 900}) => {
  const geo = useMemo(() => {
    const pos = new Float32Array(count * 3), sz = new Float32Array(count), ph = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos.set([(random(`px${i}`) - 0.5) * 16, (random(`py${i}`) - 0.5) * 22, -random(`pz${i}`) * 14 + 3], i * 3);
      sz[i] = 2 + Math.pow(random(`ps${i}`), 3) * 26; ph[i] = random(`pp${i}`) * 6.28;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('size', new THREE.BufferAttribute(sz, 1)); g.setAttribute('phase', new THREE.BufferAttribute(ph, 1));
    return g;
  }, [count]);
  const mat = useMemo(() => new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: {uT: {value: 0}, uOp: {value: 1}, uC: {value: new THREE.Color()}},
    vertexShader: `attribute float size; attribute float phase; uniform float uT; varying float vA;
      void main(){ vec3 p=position; p.x+=sin(uT*0.35+phase)*0.25; p.y+=cos(uT*0.28+phase*1.3)*0.3 + uT*0.08;
        vec4 mv=modelViewMatrix*vec4(p,1.); float d=-mv.z; gl_PointSize=size*${Q.toFixed(3)}*(6.0/max(d,0.5)); vA=clamp(1.4/max(d,0.6),0.05,0.9)*(0.6+0.4*sin(uT*1.3+phase)); gl_Position=projectionMatrix*mv; }`,
    fragmentShader: `uniform float uOp; uniform vec3 uC; varying float vA; void main(){ float d=length(gl_PointCoord-0.5)*2.0; float a=smoothstep(1.0,0.55,d)*0.7+smoothstep(1.0,0.0,d)*0.3; gl_FragColor=vec4(uC*a*vA*uOp, a*vA*uOp); }`,
  }), []);
  mat.uniforms.uT.value = time; mat.uniforms.uOp.value = opacity; mat.uniforms.uC.value.set(color);
  return <points geometry={geo} material={mat} />;
};

/* Camera-facing soft halo */
export const Halo: React.FC<{position: THREE.Vector3 | [number, number, number]; size: number; color: string; opacity: number}> = ({position, size, color, opacity}) => {
  const camera = useThree((s) => s.camera);
  const mat = useMemo(() => new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: {uC: {value: new THREE.Color()}, uOp: {value: 1}},
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `uniform vec3 uC; uniform float uOp; varying vec2 vUv; void main(){ float d=length(vUv-0.5)*2.0; float a=(exp(-d*d*6.0)*0.8+exp(-d*14.0)*0.6)*uOp; gl_FragColor=vec4(uC*a, a); }`,
  }), []);
  mat.uniforms.uC.value.set(color); mat.uniforms.uOp.value = opacity;
  if (opacity <= 0.001) return null;
  return <mesh position={position as any} quaternion={camera.quaternion.clone()} material={mat}><planeGeometry args={[size, size]} /></mesh>;
};

const protonMat = (hot: string) => new THREE.MeshPhysicalMaterial({color: '#FF6A3A', emissive: new THREE.Color(hot), emissiveIntensity: 0.6, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.1});
const neutronMat = () => new THREE.MeshPhysicalMaterial({color: '#D9D5CD', roughness: 0.35, clearcoat: 0.8, clearcoatRoughness: 0.2});

export const Proton: React.FC<{position: THREE.Vector3; r: number; glow: number; hot: string}> = ({position, r, glow, hot}) => {
  const m = useMemo(() => protonMat(hot), [hot]);
  m.emissiveIntensity = 0.4 + glow * 2.5;
  return (
    <group position={position}>
      <mesh material={m}><sphereGeometry args={[r, 40, 40]} /></mesh>
      <Halo position={[0, 0, 0]} size={r * 7} color="#FF7A30" opacity={0.25 + glow * 0.5} />
    </group>
  );
};

/* Helium-4 nucleus: 2 protons + 2 neutrons in a tight tetrahedral cluster */
export const Helium: React.FC<{position: THREE.Vector3; r: number; scale: number; rot: number; hot: string}> = ({position, r, scale, rot, hot}) => {
  const pm = useMemo(() => protonMat(hot), [hot]);
  const nm = useMemo(neutronMat, []);
  const d = r * 0.82;
  const pts: [number, number, number, boolean][] = [[d, d, d, true], [-d, -d, d, false], [-d, d, -d, true], [d, -d, -d, false]];
  return (
    <group position={position} scale={scale} rotation={[rot * 0.7, rot, rot * 0.3]}>
      {pts.map(([x, y, z, p], i) => <mesh key={i} position={[x, y, z]} material={p ? pm : nm}><sphereGeometry args={[r, 40, 40]} /></mesh>)}
    </group>
  );
};
