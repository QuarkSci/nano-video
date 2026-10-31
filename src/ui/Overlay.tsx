import React from 'react';
import {AbsoluteFill, Img, random, staticFile} from 'remotion';
import {useCurrentFrame, subTiming, f0Real} from '../warp';
import '@fontsource/unbounded/600.css';
import '@fontsource/unbounded/400.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/700.css';
import '@fontsource/inter-tight/700.css';
import '@fontsource/inter-tight/800.css';
import {brand, Accent} from '../brand';
import {r, ease, clamp01} from '../util';

export const MONO = '"JetBrains Mono", monospace';
export const DISPLAY = 'Unbounded, sans-serif';
export const SANS = '"Inter Tight", sans-serif';

/* ---------- HUD (series badge + chapter + progress) ---------- */
export const HUD: React.FC<{start: number; ep: string; chapter: string; idx: number; total: number; progress: number; accent: Accent; badgeIcon: number}> = ({start, ep, chapter, idx, total, progress, accent, badgeIcon}) => {
  const f = useCurrentFrame() - start;
  const a = r(f, 0, 14, ease.out);
  const w = r(f, 4, 30, ease.out);
  return (
    <div style={{position: 'absolute', top: 150, left: 84, right: 84, opacity: a, fontFamily: MONO, color: brand.ink}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '10px 22px 10px 12px', borderRadius: 40, border: `1.5px solid ${brand.line}`, background: 'rgba(255,255,255,0.035)', transform: `translateY(${(1 - a) * -14}px)`}}>
          <div style={{width: 40, height: 40, borderRadius: 20, background: '#0B0B0D', border: `1.5px solid rgba(255,255,255,0.18)`, display: 'grid', placeItems: 'center', overflow: 'hidden'}}>
            <Img src={staticFile('hub_icon.png')} style={{width: 34, height: 34, opacity: badgeIcon, transform: `scale(${0.6 + 0.4 * badgeIcon})`}} />
          </div>
          <span style={{fontSize: 25, fontWeight: 700, letterSpacing: 3}}>{brand.series} <span style={{color: brand.dim}}>·</span> {ep}</span>
        </div>
        <div style={{fontSize: 25, letterSpacing: 3, fontWeight: 500, transform: `translateY(${(1 - a) * -14}px)`}}>
          <span style={{color: brand.dim}}>{String(idx).padStart(2, '0')}/{String(total).padStart(2, '0')} · </span>{chapter}
        </div>
      </div>
      <div style={{display: 'flex', gap: 10, marginTop: 22}}>
        {Array.from({length: total}).map((_, i) => {
          const fill = i < idx - 1 ? 1 : i === idx - 1 ? progress : 0;
          return (
            <div key={i} style={{flex: 1, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.10)', overflow: 'hidden', transform: `scaleX(${clamp01(w * total - i)})`, transformOrigin: 'left'}}>
              <div style={{height: '100%', width: `${fill * 100}%`, background: i === idx - 1 ? accent.main : brand.ink, boxShadow: i === idx - 1 ? `0 0 12px ${accent.main}` : 'none'}} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ---------- Big number with unit + label (counts up) ---------- */
export const BigNumber: React.FC<{start: number; render: (t: number) => string; unit: string; label: string; accent: Accent; top?: number}> = ({start, render, unit, label, accent, top = 300}) => {
  const f = useCurrentFrame() - start;
  const a = r(f, 0, 12, ease.out);
  const t = r(f, 2, 40, ease.out);
  const lab = r(f, 14, 30, ease.out);
  return (
    <div style={{position: 'absolute', top, left: 80, color: brand.ink, opacity: a}}>
      <div style={{display: 'flex', alignItems: 'baseline', gap: 14, transform: `translateY(${(1 - a) * 30}px)`, filter: `blur(${(1 - a) * 10}px)`}}>
        <span style={{fontFamily: DISPLAY, fontWeight: 600, fontSize: 210, letterSpacing: -6, lineHeight: 1, fontVariantNumeric: 'tabular-nums',
          background: `linear-gradient(100deg, ${brand.ink} 35%, ${accent.hot} 70%, ${accent.main})`, WebkitBackgroundClip: 'text', color: 'transparent'}}>{render(t)}</span>
        <span style={{fontFamily: DISPLAY, fontWeight: 400, fontSize: 64, color: brand.ink}}>{unit}</span>
      </div>
      <div style={{fontFamily: MONO, fontSize: 27, letterSpacing: 4, marginTop: 18, color: brand.dim, opacity: lab, clipPath: `inset(0 ${(1 - lab) * 100}% 0 0)`}}>{label}</div>
    </div>
  );
};

/* ---------- Karaoke subtitle: spoken word white, upcoming grey, keywords accent ---------- */
export type Word = {w: string; s: number; key?: boolean};
export const Subtitle: React.FC<{words: Word[]; accent: Accent; y?: number; out?: number}> = ({words, accent, y = 1390, out}) => {
  const f0 = useCurrentFrame();
  const t = subTiming(words[0].s);                         // voice-aligned timing (output frames), when available
  const fr = f0Real();
  const f = t ? fr : f0;
  const first = t ? t.s[0] : words[0].s, last = words[words.length - 1].s;
  const end = t ? t.out : out ?? last + 40;
  const ws = t ? words.map((w, i) => ({...w, s: t.s[i]})) : words;
  if (f < first - 6 || f > end + 10) return null;
  const a = r(f, first - 6, first + 4, ease.out) * (1 - r(f, end, end + 6));
  return (
    <div style={{position: 'absolute', top: y, left: 70, right: 70, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 62, lineHeight: 1.18, letterSpacing: -0.5, opacity: a,
      textShadow: '0 4px 30px rgba(0,0,0,0.65), 0 1px 2px rgba(0,0,0,0.5)'}}>
      {ws.map((w, i) => {
        const on = r(f, w.s, w.s + 4, ease.out);
        const col = w.key ? accent.main : brand.ink;
        return (
          <span key={i} style={{display: 'inline-block', marginRight: 16, color: on > 0.5 ? col : 'rgba(242,240,235,0.38)', transform: `translateY(${(1 - on) * 6}px)`}}>{w.w}</span>
        );
      })}
    </div>
  );
};

/* ---------- Watermark + source ---------- */
export const Footer: React.FC<{source?: string; opacity: number; handleY?: number}> = ({source, opacity, handleY = 1560}) => (
  <>
    <div style={{position: 'absolute', top: handleY, width: '100%', textAlign: 'center', fontFamily: MONO, fontSize: 26, letterSpacing: 2, color: 'rgba(242,240,235,0.32)', opacity}}>{brand.handle}</div>
    {source && <div style={{position: 'absolute', bottom: 150, left: 84, fontFamily: MONO, fontSize: 21, letterSpacing: 1.5, color: 'rgba(242,240,235,0.3)', opacity}}>Manba: {source}</div>}
  </>
);

/* ---------- Film finish: animated grain + vignette (kills the "clean CG" look) ---------- */
export const FilmFinish: React.FC<{grain?: number}> = ({grain = 0.09}) => {
  const f = useCurrentFrame();
  const seed = Math.floor(random(`g${f}`) * 1000);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 65% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)'}} />
      <svg width="100%" height="100%" style={{position: 'absolute', inset: 0, mixBlendMode: 'overlay', opacity: grain * 4}}>
        <filter id={`n${seed}`}><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={seed} stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width="100%" height="100%" filter={`url(#n${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};
