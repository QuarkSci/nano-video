import {Easing, interpolate} from 'remotion';
// smooth deterministic 1D value noise (for handheld camera, flicker)
const hash = (n: number) => { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); };
export const noise1 = (x: number) => { const i = Math.floor(x), f = x - i; const u = f * f * (3 - 2 * f); return hash(i) * (1 - u) + hash(i + 1) * u; };
export const fbm1 = (x: number) => (noise1(x) + 0.5 * noise1(x * 2.13 + 7) + 0.25 * noise1(x * 4.37 + 13)) / 1.75 * 2 - 1;
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const ease = {
  out: Easing.bezier(0.16, 1, 0.3, 1),        // expo-ish out
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
  snap: Easing.bezier(0.2, 0.9, 0.1, 1),
};
export const r = (f: number, a: number, b: number, e = ease.inOut, from = 0, to = 1) =>
  interpolate(f, [a, b], [from, to], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});
// damped spring overshoot 0→1 starting at frame a
export const springAt = (f: number, a: number, fps = 30, stiffness = 120, damping = 12) => {
  const t = (f - a) / fps; if (t <= 0) return 0;
  const w = Math.sqrt(stiffness), z = damping / (2 * Math.sqrt(stiffness));
  if (z < 1) { const wd = w * Math.sqrt(1 - z * z); return 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + (z * w / wd) * Math.sin(wd * t)); }
  return 1 - Math.exp(-w * t) * (1 + w * t);
};
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
