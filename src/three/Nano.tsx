import React, {useMemo} from 'react';
import * as THREE from 'three';
import {useTexture} from '@react-three/drei';
import {staticFile} from 'remotion';
import {Accent} from '../brand';
import {clamp01, lerp} from '../util';

/*
  "Nano" v3 — the channel logo, literally assembled in 3D.
  • body  = the logo's atom: glossy black nucleus + 3 ellipse orbits at 0/60/120°
  • 4 arms = hub lines to DNA / telescope / flask / globe, each ending in a medallion carrying that icon
  • 2 legs = the two lines forming the "A" over the mountain
  morph 0 → exact logo layout (icons at their logo positions & sizes, thin hub lines, atom above)
  morph 1 → compact character (icons shrink into medallions at the arm tips, atom wraps the core)
  Units: 1 = 100 logo px, hub at origin.
*/
export type Limb = {a: number; l: number; icon?: string; logo?: [number, number, number]}; // logo: [x, y, size]
export const RAYS: Limb[] = [
  {a: 135, l: 2.3, icon: 'dna', logo: [-2.095, 1.53, 2.24]},
  {a: 38, l: 1.85, icon: 'telescope', logo: [1.765, 1.37, 2.06]},
  {a: 0, l: 1.5, icon: 'flask', logo: [1.885, -0.56, 2.0]},
  {a: 180, l: 0.95, icon: 'globe', logo: [-1.8, -0.24, 2.04]},
  {a: -132, l: 2.1},
  {a: -55, l: 1.9},
];
const ATOM_LOGO: [number, number, number] = [0.05, 1.67, 2.86];
const MOUNTAIN_LOGO: [number, number, number] = [-0.095, -1.12, 2.43];
export const CORE = 0.28;
export const MED_R = 0.2;

const sstep = (k: number) => { const c = clamp01(k); return c * c * (3 - 2 * c); };
// length of limb i in character space (keeps the logo's ratios, compressed)
export const limbLen = (i: number, k: number) => { const r = RAYS[i]; return lerp(r.l, r.icon ? 0.62 + 0.17 * r.l : 0.62 + 0.12 * r.l, sstep(k)); };
// local position of a limb's end (medallion centre / foot) — scenes use this to fire beams
export const tipLocal = (i: number, k: number) => {
  const a = (RAYS[i].a * Math.PI) / 180, L = limbLen(i, k);
  return new THREE.Vector3(Math.cos(a) * L, Math.sin(a) * L, 0.05);
};

export type NanoState = {morph: number; orbit: number; spin: number; glow: number; charge?: {i: number; v: number}; squash?: number; t?: number};

const useMats = () => useMemo(() => ({
  face: new THREE.MeshPhysicalMaterial({color: '#0A0A0C', roughness: 0.42, metalness: 0, clearcoat: 0.6, clearcoatRoughness: 0.35}),
  black: new THREE.MeshPhysicalMaterial({color: '#08080A', roughness: 0.16, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.03, ior: 1.55}),
  white: new THREE.MeshPhysicalMaterial({color: '#EFECE6', roughness: 0.36, metalness: 0, clearcoat: 0.5, clearcoatRoughness: 0.3, sheen: 0.4, sheenColor: new THREE.Color('#FFF6EA'), sheenRoughness: 0.5}),
  ring: new THREE.MeshPhysicalMaterial({color: '#E4E0D8', roughness: 0.3, metalness: 0.15, clearcoat: 1, clearcoatRoughness: 0.12}),
}), []);

const ellipse = () => {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i < 128; i++) { const t = (i / 128) * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(t), Math.sin(t), 0)); }
  return new THREE.CatmullRomCurve3(pts, true);
};

const Icon: React.FC<{name: string; size: number; color: THREE.ColorRepresentation; emissive: THREE.ColorRepresentation; ei: number; opacity: number; z?: number}> = ({name, size, color, emissive, ei, opacity, z = 0}) => {
  const tex = useTexture(staticFile(`icon_${name}.png`));
  tex.anisotropy = 8;
  return (
    <mesh position={[0, 0, z]}>
      <planeGeometry args={[size, size]} />
      <meshStandardMaterial map={tex} transparent opacity={opacity} color={color} emissive={emissive} emissiveIntensity={ei} emissiveMap={tex} roughness={0.6} depthWrite={false} />
    </mesh>
  );
};

// ellipse with constant tube thickness regardless of a/b (built per size; cheap enough at 128 pts)
const Orbit: React.FC<{a: number; b: number; tube: number; mat: THREE.Material}> = ({a, b, tube, mat}) => {
  const ka = Math.round(a * 50), kb = Math.round(b * 50);
  const geo = useMemo(() => {
    const c = ellipse(); const pts = c.getPoints(160).map((p) => new THREE.Vector3(p.x * ka / 50, p.y * kb / 50, 0));
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 220, tube, 8, true);
  }, [ka, kb, tube]);
  return <mesh geometry={geo} material={mat} />;
};

export const Nano: React.FC<{s: NanoState; accent: Accent}> = ({s, accent}) => {
  const m = useMats();
  const k = sstep(s.morph);
  const t = s.t ?? s.spin / 2.6;
  const sq = s.squash ?? 0;
  const coreR = lerp(0.2, CORE, k);
  // atom: logo position/size → wrapping the core
  const atomPos: [number, number, number] = [lerp(ATOM_LOGO[0], 0, k), lerp(ATOM_LOGO[1], 0, k), 0];
  const atomA = lerp(0.4, 0.6, k), atomB = lerp(1.2, 0.22, k);   // logo ellipses tall → character ellipses flat
  const tube = lerp(0.04, 0.013, k);
  return (
    <group scale={[1 + sq * 0.08, 1 - sq * 0.08, 1 + sq * 0.08]}>
      {/* nucleus / hub */}
      <mesh material={m.black}><sphereGeometry args={[coreR, 64, 64]} /></mesh>

      {/* atom: three ellipses at 0/60/120° (the logo's atom); electrons glow */}
      <group position={atomPos} rotation={[lerp(0, 0.4, k), lerp(0, 0.25, k), 0]}>
        {[0, 60, 120].map((deg, i) => {
          const ph = s.spin * (1 + i * 0.17) + i * 2.1;
          return (
            <group key={deg} rotation={[0, 0, (deg * Math.PI) / 180]}>
              <Orbit a={atomA} b={atomB} tube={tube} mat={m.ring} />
              {s.orbit > 0.01 && k > 0.5 && (
                <mesh position={[Math.cos(ph) * atomA, Math.sin(ph) * atomB, 0]} scale={s.orbit}>
                  <sphereGeometry args={[0.03, 16, 16]} />
                  <meshStandardMaterial color={accent.hot} emissive={accent.main} emissiveIntensity={1 + s.glow * 8} toneMapped={false} />
                </mesh>
              )}
            </group>
          );
        })}
        {/* logo atom's own nucleus — merges into the black core as the atom descends */}
        {k < 0.99 && <mesh material={m.white} scale={(1 - k) * 0.17}><sphereGeometry args={[1, 32, 32]} /></mesh>}
      </group>

      {/* mountain: only in the logo layout; melts away as the legs take over */}
      {k < 0.98 && (
        <group position={[MOUNTAIN_LOGO[0], lerp(MOUNTAIN_LOGO[1], -0.5, k), -0.02]} scale={1 - 0.7 * k}>
          <React.Suspense fallback={null}><Icon name="mountain" size={MOUNTAIN_LOGO[2]} color="#F2F0EB" emissive="#F2F0EB" ei={0.72} opacity={1 - k} /></React.Suspense>
        </group>
      )}

      {RAYS.map((r, i) => {
        const L = limbLen(i, s.morph);
        const thick = lerp(0.6, 1, k);
        const rb = 0.085 * thick + 0.004, rt = 0.06 * thick + 0.004;
        const ch = s.charge && s.charge.i === i ? s.charge.v : 0;
        const wob = Math.sin(t * 2.1 + i * 1.7) * 0.05 * k;
        const ang = (r.a * Math.PI) / 180;
        const start = coreR * 0.5;
        const len = Math.max(0.01, L - start - (r.icon ? MED_R * 0.85 * k : 0));
        let medPos: THREE.Vector3 | null = null, medSize = 0;
        if (r.icon && r.logo) {
          const a2 = ang + wob;
          const tip = new THREE.Vector3(Math.cos(a2) * L, Math.sin(a2) * L, 0);
          medPos = new THREE.Vector3(r.logo[0], r.logo[1], 0).lerp(tip, k);
          medSize = lerp(r.logo[2], MED_R * 1.6, k);
        }
        return (
          <group key={i}>
            <group rotation={[0, 0, ang + wob]}>
              <mesh material={m.white} position={[start + len / 2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
                <cylinderGeometry args={[rt, rb, len, 24, 1]} />
              </mesh>
              {!r.icon && (
                <mesh material={m.white} position={[start + len, 0, 0]} scale={thick}>
                  <sphereGeometry args={[0.09, 32, 32]} />
                </mesh>
              )}
            </group>
            {medPos && (
              <group position={medPos} scale={1 + ch * 0.18}>
                <group scale={k}>
                  <mesh material={m.face} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[MED_R, MED_R, 0.07, 48]} /></mesh>
                  <mesh material={m.white}><torusGeometry args={[MED_R, 0.026, 16, 64]} /></mesh>
                </group>
                <React.Suspense fallback={null}>
                  <Icon name={r.icon!} size={medSize} z={0.045 * k + 0.001} opacity={1}
                    color={ch > 0.05 ? accent.hot : '#F2F0EB'} emissive={ch > 0.05 ? accent.main : '#F2F0EB'} ei={ch > 0.05 ? ch * 5 : lerp(0.72, 0.32, k)} />
                </React.Suspense>
                {ch > 0.05 && (
                  <mesh position={[0, 0, 0.07]}>
                    <circleGeometry args={[MED_R * (0.7 + ch * 0.7), 48]} />
                    <meshBasicMaterial color={accent.main} toneMapped={false} transparent opacity={ch * 0.3} blending={THREE.AdditiveBlending} depthWrite={false} />
                  </mesh>
                )}
              </group>
            )}
          </group>
        );
      })}
      {s.glow > 0.01 && <pointLight position={[0, 0, 0.9]} color={accent.main} intensity={s.glow * 0.6} distance={2} />}
    </group>
  );
};
