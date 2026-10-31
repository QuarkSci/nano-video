import {useCurrentFrame as real, useVideoConfig} from 'remotion';
import W from './warp.json';

/* Piecewise-linear time map: composition (output) frame -> design frame. Anchors come from the voice alignment. */
export const mapFrame = (id: string, f: number): number => {
  const a = (W as any).anchors?.[id] as [number, number][] | undefined;
  if (!a || a.length < 2) return f;
  if (f <= a[0][0]) return a[0][1] + (f - a[0][0]);
  for (let i = 1; i < a.length; i++) {
    if (f <= a[i][0]) { const [x0, y0] = a[i - 1], [x1, y1] = a[i]; return y0 + ((f - x0) / (x1 - x0)) * (y1 - y0); }
  }
  const [x, y] = a[a.length - 1]; return y + (f - x);
};
export const useCurrentFrame = () => { const f = real(); const {id} = useVideoConfig(); return mapFrame(id, f); };

/* voice-aligned subtitle timings, keyed by composition + first word's design frame; values in output frames */
export const subTiming = (s0: number): {s: number[]; out: number} | undefined => {
  const {id} = useVideoConfig();
  return (W as any).subs?.[id + ':' + s0];
};
export const f0Real = () => real();
