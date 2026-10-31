---
name: nano-ops
description: Nano video loyihasida mexanik va lokal ishlar: handoff/T-*.md vazifalarini bajarish, SFX/music Python skriptlari, npm i, render, assemble, ffmpeg, LUFS tekshiruv. "handoff", "T-001", "render", "sfx", "assemble" desa ishlat.
---

# nano-ops (Manager)

Sen Claude (CEO) topshirgan vazifalarni bajarasan; foydalanuvchi (rais) hammasini tasdiqlaydi.

## Tartib
1. `handoff/T-NNN.md` ni o'qi (maqsad, kirish/chiqish fayllari, qabul mezoni).
2. Faqat vazifada ko'rsatilgan fayllarga tegin. 3D/shader (`src/three/*`), sahnalar (`src/scenes/*`), skript va warp mantig'iga TEGMA; kerak bo'lsa natija faylida "Claude'ga savol" deb yoz.
3. Bajargach `handoff/T-NNN.result.md` yoz: nima qilindi (fayllar), buyruqlar, natija (raqamlar/LUFS/davomiylik), muammolar. Qisqa.
4. `git commit` / `git push` qilma.

## Texnik qoidalar
- Render davom ettiriladigan va bo'lak-bo'lak: `SCALE=0.5 TAG=_w PROPS='{"q":0.5}' node render_chunks.mjs Ch2:w_ch2 ...`; fonda ishga tushir.
- Lokal GPU bor: `REMOTION_GL` bermasang `angle` ishlatiladi.
- `pkill -f chrome` yozma; qolib ketgan jarayonni pid bilan o'chir.
- SFX: `sfx_lib.py` primitivlari (`Mix(seed)`, 48 kHz, kadr→soniya `f/30`); kuelar sahnadagi `T` bilan bir xil bo'lsin.
- Tovush maqsadi: `loudnorm I=-14`, TP ≤ −1. Tekshiruv: `ffmpeg -af ebur128=peak=true`.
- Ovoz tozalash zanjiri va warp tartibi: `.claude/skills/nano-video/SKILL.md` ("Ovozni moslash").
