"""Ambient score bed for the whole episode (deterministic synth, no samples).
Warm detuned pads on a slow i–VI–III–VII progression in A minor, a soft pulse that thickens with the story,
and a lift into the final chord. usage: python3 music.py out/music.wav <duration_seconds>"""
import sys, numpy as np
from sfx_lib import SR, Mix, lp, env, tone

dur = float(sys.argv[2]) if len(sys.argv) > 2 else 57.0
m = Mix(dur, seed=5)
t = np.arange(m.N) / SR
bar = 4 * 60 / 84                                          # 84 bpm, 4/4
chords = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]   # Am, F, C, G (MIDI)
hz = lambda n: 440 * 2 ** ((n - 69) / 12)

def pad(freqs, d):
    n = int(d * SR); x = np.arange(n) / SR; s = np.zeros(n)
    for f in freqs:
        for det in (-0.12, 0.0, 0.11):                      # supersaw-ish detune, sine-based (soft)
            ff = f * 2 ** (det / 12)
            s += np.sin(2 * np.pi * ff * x + np.sin(2 * np.pi * 0.3 * x) * 0.3) + 0.3 * np.sin(4 * np.pi * ff * x)
    a = np.minimum(1, x / 1.2) * np.minimum(1, (d - x) / 1.0)
    return s * a / (len(freqs) * 3)

i = 0; t0 = 0.0
while t0 < dur:
    ch = chords[i % 4]
    p = pad([hz(n) for n in ch] + [hz(ch[0] - 12)], bar * 1.05)
    m.add(lp(p, 1400 + 900 * np.sin(i * 0.7) ** 2), t0, 0.55)
    # pulse: eighth notes on the root/fifth, enters after the intro and grows
    if t0 > 9:
        for k in range(8):
            nt = ch[0] + (12 if k % 2 else 0) + (7 if k in (3, 6) else 0)
            g = 0.05 + 0.05 * min(1, (t0 - 9) / 30)
            m.add(tone(hz(nt), hz(nt), 0.22) * env(int(0.22 * SR), 0.004, 0.12, 5), t0 + k * bar / 8, g, -0.4 + 0.8 * (k % 2))
    i += 1; t0 += bar
# sub swell into the logo resolve (last 10 s), then a held A-minor add9 chord
end = dur - 10
m.add(tone(55, 55, 9.5) * np.minimum(1, np.arange(int(9.5 * SR)) / SR / 4) * np.exp(-np.maximum(0, np.arange(int(9.5 * SR)) / SR - 5) * 0.6), end, 0.35)
fin = pad([hz(n) for n in (45, 57, 60, 64, 71)], 8.0)
m.add(lp(fin, 2400), dur - 6.6, 0.7)
m.render(sys.argv[1], reverb=0.35, target_peak=0.7)
print('ok', sys.argv[1])
