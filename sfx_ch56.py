"""Ch5 (VAQT) and Ch6 (XULOSA) sound design. usage: python3 sfx_ch56.py out/sfx_ch5.wav out/sfx_ch6.wav"""
import sys
from sfx_lib import *

# ---------- Ch5 ----------
T = dict(gauge=0, count=8, ratio=92, nanoIn=112, arrive=136, charge=132, fire=146, line=148, dock=162, dockEnd=190, travel=160, end=300)
m = Mix(10.0, seed=19)
bed(m, level=0.14)
tonesweep(m, fr(0), 0.6, 300, 900, 0.14, 0, 0)                       # gauge draws up
# slow "clock" ticks while the years count (tick rate rises with the counter)
for k in range(28):
    u = k / 27
    m.add(tone(1500, 1500, 0.02) * env(int(0.02 * SR), 0.0003, 0.008, 6), fr(T['count']) + fr(T['ratio'] - T['count']) * (1 - (1 - u) ** 1.6), 0.07, -0.2)
rumble(m, fr(T['count']), 2.8, 0.35)
blip(m, fr(T['ratio']), 0.1, 880); chime(m, fr(T['ratio'] + 4), (659.25, 987.8), 0.07, 0.3, 1.6)
click(m, fr(T['nanoIn']), 0.18, -0.7); whoosh(m, fr(T['nanoIn']), d=fr(24), gain=0.3, pan0=-0.7, pan1=0)
riser(m, fr(T['charge']), fr(T['fire'] - T['charge']), 0.35)
m.add(hp(m.noise(0.06), 2500) * env(int(0.06 * SR), 0.0005, 0.02, 8), fr(T['fire']), 0.45)
tonesweep(m, fr(T['line']), 0.75, 400, 1600, 0.16, -0.8, 0.8)          # timeline draws across
whoosh(m, fr(T['dock']), d=fr(28), gain=0.25, pan0=0, pan1=-0.8); click(m, fr(T['dockEnd']), 0.18, -0.7)
# photon travels through history: soft pings at each event (log positions mapped by the scene)
import math
lx = lambda yr: 1 - math.log(1 + yr / 1000) / math.log(171)
def inv(v):
    lo, hi = 0.0, 1.0
    for _ in range(30):
        mid = (lo + hi) / 2; e = mid * mid * mid * 4 if mid < 0.5 else 1 - (-2 * mid + 2) ** 3 / 2  # approx inOut
        lo, hi = (mid, hi) if e < v else (lo, mid)
    return lo
for i, yr in enumerate([65000, 12000, 5200, 0]):
    tt = fr(T['travel']) + fr(T['end'] - 30 - T['travel']) * inv(lx(yr))
    chime(m, tt, ([784, 1046.5], [880, 1318.5], [987.8, 1480], [1318.5, 1975.5, 2637])[i], 0.08 + 0.03 * (i == 3), -0.6 + i * 0.4, 1.8)
m.render(sys.argv[1]); print('ok', sys.argv[1])

# ---------- Ch6 ----------
T = dict(recap=0, nanoIn=84, center=120, unmorph=146, logo=186, title=196, card=214, tap=252, end=300)
m = Mix(10.0, seed=23)
bed(m, level=0.15)
tonesweep(m, fr(8), 0.4, 600, 900, 0.1, -0.3, 0.3)
tonesweep(m, fr(22), 1.6, 200, 800, 0.16, -0.5, 0.5)                   # long bar grows
click(m, fr(T['nanoIn']), 0.18, -0.7); whoosh(m, fr(T['nanoIn']), d=fr(36), gain=0.35, pan0=-0.7, pan1=0)
chime(m, fr(T['center']), (523.25, 784), 0.06, 0, 1.6)
riser(m, fr(T['unmorph'] - 6), fr(T['logo'] - T['unmorph'] + 6), 0.45)
whoosh(m, fr(T['unmorph']), d=1.1, gain=0.35, pan0=0.3, pan1=-0.3, bright=3500)
impact(m, fr(T['logo']), 0.9, sub=(65, 30))
chime(m, fr(T['logo'] + 1), (261.63, 392, 523.25, 659.25, 784, 1046.5), 0.14, 0, 3.0)   # logo resolve chord
blip(m, fr(T['title']), 0.06, 1318.5); whoosh(m, fr(T['card'] - 3), d=0.45, gain=0.2, pan0=0, pan1=0, bright=3000)
click(m, fr(T['tap']), 0.3, 0.2, 2000); chime(m, fr(T['tap'] + 4), (1318.5, 1975.5), 0.1, 0.2, 1.4)
m.render(sys.argv[2]); print('ok', sys.argv[2])
