"""Reusable synthesis primitives for the channel's sound design (deterministic, no samples)."""
import numpy as np, wave
from scipy.signal import butter, sosfilt

SR = 48000

class Mix:
    def __init__(self, dur, seed=7):
        self.N = int(SR * dur); self.dur = dur
        self.L = np.zeros(self.N); self.R = np.zeros(self.N)
        self.rng = np.random.default_rng(seed)

    # ---------- helpers ----------
    def noise(self, d): return self.rng.standard_normal(int(d * SR))

    def add(self, sig, t0, gain=1.0, pan=0.0):
        i = int(t0 * SR); j = min(self.N, i + len(sig))
        if j <= i: return
        sig = sig[: j - i] * gain
        pan = np.broadcast_to(np.asarray(pan, float), (len(sig),)) if np.ndim(pan) else pan
        if np.ndim(pan): pan = pan[: j - i]
        self.L[i:j] += sig * np.sqrt(0.5 * (1 - pan)); self.R[i:j] += sig * np.sqrt(0.5 * (1 + pan))

    def render(self, path, reverb=0.22, target_peak=0.89):
        t = np.arange(self.N) / SR
        L = self.L + reverb * _reverb(self.L, 1, self.N); R = self.R + reverb * _reverb(self.R, 2, self.N)
        fade = np.minimum(1, (self.dur - t) / 0.5) * np.minimum(1, t / 0.05)
        out = np.stack([L, R], 1) * fade[:, None]
        out = np.tanh(out * 1.4) / np.tanh(1.4)
        out *= target_peak / max(1e-9, np.abs(out).max())
        with wave.open(path, 'wb') as w:
            w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype('<i2').tobytes())


def env(n, a, d, curve=3.0):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) * curve / max(d, 1e-4))

def lp(x, cut):
    cut = np.asarray(cut, dtype=float)
    if cut.ndim == 0:
        return sosfilt(butter(2, min(float(cut), SR * 0.45), 'low', fs=SR, output='sos'), x)
    y = np.zeros_like(x); B = 512; zi = None
    for i in range(0, len(x), B):
        c = float(np.clip(cut[min(i + B // 2, len(cut) - 1)], 20, SR * 0.45))
        sos = butter(2, c, 'low', fs=SR, output='sos')
        if zi is None: zi = np.zeros((sos.shape[0], 2))
        y[i:i + B], zi = sosfilt(sos, x[i:i + B], zi=zi)
    return y

def hp(x, cut): return x - lp(x, cut)

def tone(f0, f1, dur):
    n = int(dur * SR); f = np.geomspace(f0, f1, n); return np.sin(2 * np.pi * np.cumsum(f) / SR)

def _reverb(x, seed, N):
    g = np.random.default_rng(seed); n = int(1.6 * SR); ir = g.standard_normal(n) * np.exp(-np.arange(n) / SR * 4.2); ir[0] = 0
    ir = lp(ir, 5000); ir /= np.sqrt((ir ** 2).sum())
    return np.fft.irfft(np.fft.rfft(x, 2 * N) * np.fft.rfft(ir, 2 * N))[:N]

fr = lambda f: f / 30.0

# ---------- event primitives ----------
def bed(m, warm_from=None, level=0.16):
    t = np.arange(m.N) / SR
    b = 0.5 * np.sin(2 * np.pi * 55 * t) + 0.35 * np.sin(2 * np.pi * 55.4 * t + 1) + 0.18 * np.sin(2 * np.pi * 82.4 * t)
    sw = 1.0 if warm_from is None else (0.6 + 0.4 * np.clip((t - warm_from) / 2, 0, 1))
    b *= np.minimum(1, t / 1.0) * sw
    air = lp(hp(m.noise(m.dur), 900), 3500) * 0.012 * np.minimum(1, t / 1.5)
    m.L += b * level + air; m.R += b * level + np.roll(air, 300)

def whoosh(m, t0, d=0.9, gain=0.4, pan0=0.6, pan1=-0.6, bright=5000):
    n = m.noise(d); s = np.sin(np.linspace(0, np.pi, len(n)))
    w = lp(hp(n, 400), 800 + bright * s) * s ** 3
    m.add(w, t0, gain, np.linspace(pan0, pan1, len(w)))

def click(m, t0, gain=0.25, pan=0.0, f=2400):
    m.add(tone(f, f * 0.75, 0.05) * env(int(0.05 * SR), 0.0005, 0.02, 6), t0, gain, pan)

def blip(m, t0, gain=0.12, f=880, pan=0.0):
    m.add((tone(f, f, 0.25) + 0.5 * tone(f * 1.5, f * 1.5, 0.25)) * env(int(0.25 * SR), 0.002, 0.12, 5), t0, gain, pan)

def riser(m, t0, d, gain=0.6):
    n = m.noise(d); x = np.linspace(0, 1, len(n))
    m.add(lp(n, 400 + 6000 * x ** 2) * x ** 2 * 0.8 + tone(110, 440, d) * x ** 3 * 0.5, t0, gain)

def impact(m, t0, gain=1.0, sub=(90, 28)):
    m.add(hp(m.noise(0.08), 2000) * env(int(0.08 * SR), 0.0005, 0.03, 8), t0, 0.7 * gain)
    m.add(tone(sub[0], sub[1], 1.8) * env(int(1.8 * SR), 0.002, 1.2, 3), t0, 1.0 * gain)
    m.add(lp(m.noise(2.0), 900) * env(int(2.0 * SR), 0.01, 1.4, 3), t0, 0.35 * gain)

def rumble(m, t0, d, gain=1.0):
    n = m.noise(d); x = np.linspace(0, 1, len(n))
    m.add(lp(n, 120 + 380 * np.sin(np.pi * np.minimum(1, x * 1.2)) ** 2) * np.sin(np.pi * np.minimum(1, x * 1.15)) ** 1.5, t0, gain)

def chime(m, t0, freqs=(1046.5, 1568, 2093), gain=0.12, pan=0.0, d=1.6):
    m.add(sum(tone(f, f, d) * env(int(d * SR), 0.004, d * 0.56, 4) / (i + 1) for i, f in enumerate(freqs)), t0, gain, pan)

def ticks(m, t0, n, span, gain=0.09, f=2200, curve=2.2, pan=0.2):
    for k in range(n):
        u = k / max(1, n - 1)
        m.add(tone(f, f, 0.02) * env(int(0.02 * SR), 0.0003, 0.008, 6), t0 + span * u ** curve, gain * (1 - 0.5 * u), pan)

def sizzle(m, t0, d, gain=0.3, pan0=-0.2, pan1=0.3):
    """plasma cut: crackly band noise with random pops"""
    n = m.noise(d); x = np.linspace(0, 1, len(n))
    base = lp(hp(n, 1500), 7000) * (0.6 + 0.4 * np.sin(x * 90) ** 2)
    pops = (m.rng.random(len(n)) > 0.9993) * m.rng.uniform(1, 3, len(n))
    base += lp(pops, 6000) * 4
    m.add(base * np.sin(np.pi * x) ** 0.5, t0, gain, np.linspace(pan0, pan1, len(n)))

def tonesweep(m, t0, d, f0, f1, gain=0.25, pan0=-0.8, pan1=0.8):
    x = np.linspace(0, 1, int(d * SR))
    m.add(tone(f0, f1, d) * np.sin(np.pi * x) ** 2, t0, gain, np.linspace(pan0, pan1, len(x)))
