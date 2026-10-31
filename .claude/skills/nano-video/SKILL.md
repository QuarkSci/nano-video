---
name: nano-video
description: Science | MuhammadYusuf (@nano_scientist) Telegram kanali uchun 9:16 animatsion-ma'lumotli video yasash (Remotion + Three.js, 3D maskot Nano, ovoz bilan vaqt moslash). "video", "skript", "bob", "Nano", "subtitr", "warp", "render" haqida so'ralganda ishlat.
---

# Nano video — qisqa yo'riqnoma (Claude = CEO)

Foydalanuvchi MuhammadYusuf o'zbekcha gaplashadi (ba'zan ingliz aralash). Javob qisqa va amaliy.
Kod `src/` da TAYYOR: qayta yozma, o'qib o'zgartir. Eski to'liq matn `docs/PLAYBOOK_FULL.md` (faqat shu fayldan javob topilmasa och).

## Kengash (rollar)
| Rol | Kim | Nima qiladi |
|---|---|---|
| Rais | Foydalanuvchi | mavzu, yakuniy qaror, ovoz yozish, animatikni `npx remotion studio` da ko'rish |
| CEO | Claude | skript, sahna dizayni, `Ch*.tsx` (3D/animatsiya), warp mantig'i, review |
| Manager | Antigravity (`agy`) | SFX/music skriptlari, npm/render/assemble ishga tushirish, mexanik o'zgartirish. `handoff/` orqali |
| Tadqiqot | Gemini Deep Research / AI Studio | faktlar jadvali (raqam, qiymat, manba URL); audiodan vaqt belgilari |

## Maqsad
Vertikal 1080×1920, 30 fps, ~55–60 s, 5–6 bob. Andoza `9.mp4` darajasi: 3D relyef, HUD (bob progressi), katta raqamlar, shisha kartalar, karaoke subtitr, manba qatori, ~−14 LUFS. "AI yasagani bilinmasin": oddiy 2D shablon bilan to'xtama (3D, bloom, glass UI, aniq tovush).
Nano maskoti: HUD nishonidan uchib chiqadi → nur otadi → sahna o'zgaradi (sabab→oqibat) → nishonga qaytib qo'nadi.
Har videoda faqat mavzu / skript / ma'lumot / aksent rang o'zgaradi; HUD, Nano, tovush, render bir xil.

## Brend (o'zgarmas)
- Fon `#07090D`, matn `#F2F0EB`. Shriftlar: Unbounded (sarlavha), JetBrains Mono (HUD), Inter Tight (subtitr), `@fontsource/*`.
- Aksent mavzuga qarab: `accents.sun | bio | space | water` (`src/brand.ts`).
- Logo `public/logo_white.png`; ikonlar `icon_{dna,telescope,globe,flask,atom,mountain}.png` + `hub_icon.png` logodan scipy.ndimage bilan kesiladi (hub nurlarini o'chirib, chetga tegadigan mayda bo'laklarni tozalab). Logoni foydalanuvchi qayta yuboradi.
- Pastda `@nano_scientist`, tepada `SCIENCE · #NN`.

## Ish tartibi
1. Brif (qisqa): mavzu, ovoz (odatda o'z ovozi), aksent.
2. Faktlar: tadqiqot jadvalidan; har raqam manbali, sahna pastida `Footer source=...`. 3–5 asosiy raqamni foydalanuvchi tekshiradi.
3. Skript: 5–6 bob, har bob = 1 g'oya + 1 katta raqam + 1 vizual metafora. Qisqa gaplar (subtitr 3–6 so'zlik bo'laklar).
4. Sahna dizayni: har bob uchun 3D ob'ekt, HUD yozuvi, katta raqam, kartalar, Nano harakati (qaysi medalyon bilan nur otadi).
5. Kod: har bob alohida kompozitsiya `Ch1..Ch6`, umumiy `ui/` va `three/`.
6. SFX/music: Antigravity'ga `handoff/` orqali (kuelar `T` dan).
7. Animatik (`q=0.5`): foydalanuvchi Studio'da ko'radi, fikrini matn bilan aytadi.
8. Ovoz → "Ovozni moslash" bo'limi → qayta render.
9. Yakuniy render lokal, bo'lak-bo'lak → `assemble.sh` → tekshiruv (LUFS, davomiylik, kadrlar).

## Kod qoidalari
- Sahnalar `useCurrentFrame` ni `../warp` dan import qiladi (remotion'dan emas): vaqt moslash shu orqali ishlaydi.
- Har bob `T = {...}` da kadr kuelarini saqlaydi (undock, fire, dock, number, end...). SFX skriptlari ularni qo'lda takrorlaydi: ikkalasini birga yangila.
- Subtitr: `<Subtitle words={[{w,s,key?}]} out={kadr}/>`; `s` = so'z boshlanish kadri, `key:true` = aksentli raqam/atama; bo'lak 3–6 so'z, `y` 1530–1600 (handleY va watermark bilan to'qnashmasin).
- Bob oxirida Nano HUD nishoniga qo'nadi (`dock`..`dockEnd`).
- 1-bob: 0–14 kadr qoradan fade-in; logo → morph → Nano. Oxirgi bob: teskari morph (Nano → aniq logo) + kanal nomi + "Obuna" kartasi + qoraga so'nish.
- `quality.ts`: `Q` input prop → `ThreeCanvas dpr={Q}` va nuqta shaderlarida `*Q`.

## Nano (muhim)
Model logoga ko'zga ko'rinadigan darajada aloqador bo'lsin. Tana = logodagi atom (qora yadro + 0°/60°/120° orbitalar); 4 qo'l = hub chiziqlari, uchida medalyon (DNK, teleskop, kolba, globus); 2 oyoq = tog' ustidagi "A" chiziqlari. `morph 0` = aniq logo, `morph 1` = personaj. Manba: `src/three/Nano.tsx` (`RAYS`, `tipLocal`, `limbLen`). Medalyon mavzuga mos: fizika→teleskop, kimyo→kolba, tarix/Yer→globus, biologiya→DNK.

## Ovozni moslash (eng nozik qism)
Muammo: foydalanuvchi skriptni o'z tezligida o'qiydi, animatsiya boshqa tezlik uchun yozilgan.
1. Tozalash (`voice/clean.wav`): `ffmpeg -af "adeclip,highpass=f=75,equalizer=f=220:t=q:w=1.2:g=-2.5,equalizer=f=3200:t=q:w=1:g=2.5,equalizer=f=7500:t=q:w=1.5:g=-2,highshelf=f=9000:g=2,acompressor=threshold=-22dB:ratio=3:attack=8:release=120:makeup=3,alimiter=limit=0.89,loudnorm=I=-16:TP=-1.5:LRA=7"`. Odatiy muammo: qirqilish va xona aks-sadosi. Yozishda mikrofon 10–15 sm, yumshoq xona.
2. Vaqt belgilari: (a) ishlagan yo'l: `voice/asr.py` (sherpa-onnx + whisper-small; o'zbekcha matn buziladi, lekin gap bloklari va pauzalarni topadi); (b) SINALMAGAN, sinab ko'r: AI Studio'da audio → har gruppa uchun start/end JSON. Natijani 9-qadamdagi kadr tekshiruvi bilan tasdiqla.
3. Bloklar: energiya (RMS −38…−40 dB) bo'yicha nutq oraliqlari; <0.18 s bo'shliqlarni to'ldir, <0.15 s portlashlarni tashla; bloklarni gruppalarga qo'lda moslang (`voice/make_align.py` → `align.json`).
4. Blok ichida gruppa vaqti bo'g'inlar soniga proporsional (sonlar so'z bilan: 8→"sakkiz"). Aniqlik ±0.2–0.3 s.
5. Warp (`align2.py`): faqat blok boshlari bo'yicha ankerlar (gruppa bo'yicha qilsang jerky). Tezlik 0.55–1.45×; kerak bo'lsa bloklar orasiga jim pauza `SH={blokIndeks: soniya}`. Bob chegaralari xaritadan teskari hisoblanadi → `warp.json: durations`.
6. Subtitr warp'dan mustaqil: `warp.json: subs["CompId:birinchiSo'zDizaynKadri"] = {s:[chiqish kadrlari], out}`.
7. SFX: `warp_audio.py` har oraliqni `atempo` bilan cho'zadi → `out/sfx_warped.wav`. Musiqa: `music.py out/music.wav <soniya>`. Ovoz: bloklar chiqish vaqtiga (±0.12 s hoshiya, 20 ms fade) → `voice/voice_out.wav`.
8. Tekshir: moslangan videodan bir necha kadr (`ffmpeg -ss t`), subtitr aytilayotgan so'zda turibdimi.
- Skriptdan boshqacha o'qilsa, subtitr matni o'qilganiga moslansin.
- `align2.py` ichida bob dizayn boshlanishlari `chs`/`bounds` ro'yxatida qattiq yozilgan (masalan `[0,10,20,29,37,47]`): yangi video uchun yangila.

## Tovush va yig'ish
48 kHz, deterministik (`Mix(seed)`), kadr→soniya `f/30`. Primitivlar `sfx_lib.py`. Keng polosali shovqinda scipy `butter/sosfilt` ishlat. Musiqa: Am–F–C–G ambient pad + 8-lik puls. `assemble.sh <prefix> <out.mp4> [voice.wav]`: concat, SFX+musiqa (ovoz bo'lsa sidechain duck), `loudnorm I=-14 TP=-1`, film finish, `libx264 -crf 21`. Tekshiruv: `ffmpeg -af ebur128=peak=true` (maqsad ≈ −14 LUFS, TP ≤ −1).

## Render qoidalari
- Davom ettiriladigan bo'lak-bo'lak: `SCALE=0.5 TAG=_w PROPS='{"q":0.5}' node render_chunks.mjs Ch2:w_ch2 TestClip2:w_ch1 ...`
- Oldin og'ir kadrlarni tekshir: `PROPS='{"q":0.5}' node stills.mjs Ch2 0 60 120` (bob boshiga ko'pi bilan 3 kadr).
- Faqat ovoz o'zgarsa videoni qayta renderlama (`-c:v copy`). Faqat bitta bob o'zgarsa o'sha bobning bo'laklarini. Warp o'zgarsa (davomiylik o'zgaradi) eski bo'laklar yaroqsiz: yangi TAG.
- Bo'lak nomi: `out/chunks/<Comp><TAG>_<boshKadr 4 xona>.mp4`.

## Muhit
- Lokal (asosiy): GPU, `angle`. Claude sandbox (GPU yo'q): `REMOTION_GL=swangle REMOTION_BROWSER=<playwright chrome>`; 1080×1920 q=1 ≈ 17 s/kadr, shuning uchun sandbox'da faqat animatik/stills.
- Sandbox tarmog'i: npm/pip/GitHub ishlaydi; HuggingFace, pytorch.org, OpenAI ishlamaydi (model kerak bo'lsa GitHub releases).
- `pkill -f chrome` ni buyruq ichida yozma (o'z shell'ingni o'ldiradi, exit 144); `kill -9 <pid>`.

## Token qoidalari
Kodni qayta yozma. Faylni butunlay qayta o'qima (`Read` offset/limit yoki grep). Uzoq renderni kuzatib o'tirma. Sonnet yetarli, Opus faqat yangi murakkab 3D/shader uchun. Bir chat = bir bob.

## Xatolar → yechim
| Muammo | Yechim |
|---|---|
| Kadr ~20 s | SMAA, backdrop-filter olib tashla, bloom yengillat, `q` prop |
| Uzun render timeout/exit 144 | bo'lak-bo'lak, fonda, davom ettiriladigan skript |
| Nur "ustun"dek yo'g'on | `Beam` — ingichka harakatlanuvchi bolt |
| Subtitr/watermark/kartalar to'qnashadi | `handleY`, qisqa bo'laklar va `out` |
| Logo kesmalarida parchalar | scipy.ndimage bilan chetga tegadigan mayda komponentlarni olib tashla |
| "Model logoga o'xshamaydi" | Nano v3: logo ikonlaridan yig'ilgan, morph 0 = aniq logo |
| Ovoz–subtitr mos emas | "Ovozni moslash" bo'limi |

## Repo'da YO'Q narsalar (birinchi vazifa shularni tiklash)
`src/scenes/*` (GLTest, LookDev, TestClip, LookDev2, TestClip2=Ch1, Ch2..Ch6), `src/ui/DataUI.tsx`, `src/ui/LightPath.tsx`, `src/three/FX.tsx`, `SunCut.tsx`, `Studio.tsx`, `sfx.py`, `sfx_ch2..ch4.py`, `src/warp.json`, `public/*` aktivlari. Shuning uchun `Root.tsx` hozir kompilyatsiya bo'lmaydi.
Ochiq masalalar: (1) shablonni JSON-boshqariladigan qilish (skript → sahna): keyingi videolarda faqat JSON + bitta maxsus 3D ob'ekt; kuelar `T` ni bitta `cues.json` ga chiqarish; (2) litsenziyali musiqa o'rniga sintez bed ishlatilgan; (3) to'liq sifat (1080×1920) yakuniy renderi hali yo'q.
