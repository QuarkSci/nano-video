# NANO VIDEO PIPELINE — to'liq ko'rsatma (Science | MuhammadYusuf, @nano_scientist)

> Bu fayl boshqa chatga yuklanganda shu yerda qilingan ishni qaytadan, xuddi shu sifatda bajarish uchun yozilgan.
> Oxirida (APPENDIX) loyihaning asosiy manba kodlari bor: ularni fayl nomi bo'yicha qayta yarating.
> Foydalanuvchi: MuhammadYusuf, o'zbek tilida gaplashadi (ba'zan ingliz aralash). Javoblarni o'zbekcha, qisqa va amaliy yozing.

## 0. Maqsad
Telegram kanali uchun **animatsion + informativ + ma'lumotga boy vertikal video (9:16, 1080×1920, 30 fps)** — andoza `9.mp4` darajasida: 3D relyef/ob'ektlar, HUD (bob progressi), katta raqamlar, shisha kartalar, "karaoke" subtitr, manba qatori, ~−14 LUFS tovush.
Voqealar rivojini o'zgartiruvchi **3D maskot "Nano"** (kanal logosidan yig'ilgan) bor: u HUD nishonidan uchib chiqadi → nur otadi → sahna o'zgaradi (sabab→oqibat) → nishonga qaytib qo'nadi.
Shablon: har yangi videoda faqat **mavzu / skript / ma'lumotlar / aksent rangi** o'zgaradi, qolgan hammasi (HUD, Nano, tovush, render) bir xil.

## 1. Brend (o'zgarmas)
- Fon `#07090D`, matn issiq oq `#F2F0EB`. Shriftlar: **Unbounded** (sarlavha), **JetBrains Mono** (HUD), **Inter Tight** (subtitr) — `@fontsource/*`.
- Aksent rang **mavzuga qarab**: `accents.sun` (amber, fizika/quyosh), `bio`, `space`, `water`. Qora/oq asos doim bir xil.
- Logo: `public/logo_white.png`. Logo ichidan kesilgan ikonlar: `icon_{dna,telescope,globe,flask,atom,mountain}.png` + `hub_icon.png` (HUD nishoni). Logoni yangi chatga foydalanuvchi qayta yuboradi; ikonlarni scipy.ndimage bilan kesing (hub nurlarini o'chirib, chetga tegadigan mayda bo'laklarni tozalab).
- Kanal belgisi: pastda `@nano_scientist`, tepada `SCIENCE · #01`.

## 2. Ish tartibi (yuqoridan pastga)
1. **Brif** (AskUserQuestion bilan qisqa): mavzu, ovoz (o'z ovozi / TTS), aksent rang. Odatiy: o'z ovozi.
2. **Faktlar** — faqat tekshirilgan manbadan (NASA, Wikipedia, darslik). Har raqam uchun manba yozib qo'ying; sahna pastida `Footer source=...` bilan ko'rsating. Joriy ma'lumot bo'lsa WebSearch.
3. **Skript** — 5–6 bob, ~55–60 soniya. Har bob = bitta g'oya + bitta katta raqam + bitta vizual metafora. Qisqa gaplar (subtitr 3–6 so'zlik bo'laklarga bo'linadi).
4. **Sahna dizayni** — har bob uchun: 3D ob'ekt, HUD yozuvi, katta raqam, kartalar, Nano nima qiladi (qaysi medalyon bilan nur otadi).
5. **Kod** — har bob alohida Remotion kompozitsiyasi (`Ch1..Ch6`), umumiy `ui/` va `three/` kutubxonasi.
6. **Tovush dizayni** — hammasi sintez (numpy/scipy): har bob uchun `sfx_chN.py`, `music.py` fon musiqasi. Kadr raqamlariga bog'langan.
7. **Animatik** (yarim o'lcham, q=0.5) → foydalanuvchiga ko'rsatish, fikr olish.
8. **Ovoz**: foydalanuvchi o'z ovozini yozadi (skriptni bering). Tozalash → ASR → **vaqt moslash (warp)** (6-bo'lim).
9. **Yakuniy render** 1080×1920 q=1, bo'lak-bo'lak, fonda → `assemble.sh` → ffmpeg film finish → yuborish (`SendUserFile`).
10. Foydalanuvchiga: nima tayyor, nima taxminiy, keyingi qadam (bir-ikki gap).

Ish boshida `TaskCreate` bilan reja, oxirgi qadam — tekshirish (kadr varaqlari, tovush LUFS, davomiylik).

## 3. Texnik stek va muhit
- **Remotion 4** (React→MP4) + **Three.js** (`@remotion/three` `ThreeCanvas`, `@react-three/fiber`, `drei`, `@react-three/postprocessing`: Bloom, ToneMapping ACES, SMAA, ChromaticAberration). Versiyalar: `package.json` APPENDIX'da.
- Muhit GPU'siz: `chromiumOptions: {gl: 'swangle'}`, brauzer `/opt/pw-browsers/chromium-*/chrome-linux64/chrome` (Playwright bilan keladi; qayta o'rnatmang). `remotion.config.ts`: swangle, concurrency 2, jpeg 95.
- Tarmoq allowlist: npm/pip/GitHub ishlaydi; **HuggingFace, pytorch.org, OpenAI/Azure ishlamaydi**. Model kerak bo'lsa **GitHub releases** (k2-fsa/sherpa-onnx) dan oling.
- `pip install --break-system-packages ...`.
- Render sekin: 1080×1920 q=1 ≈ 17 s/kadr; q=0.5 ≈ 8 s/kadr; yarim o'lcham (scale 0.5) animatik 30 kadr ≈ 115 s. 57 s video (1710 kadr) animatik ≈ 1.5–2 soat, to'liq sifat ≈ 7–8 soat. **Doim fonda va bo'lak-bo'lak** (`run_in_background`), tool timeout'iga tushmang.
- `pkill -f chrome` ni **buyruq ichida yozmang** (o'z shell'ingizni ham o'ldiradi, exit 144). Qolib ketgan Chrome/remotion/ffmpeg jarayonlarini `kill -9 <pid>` bilan toping va o'chiring — ular soatlab CPU yeydi.
- `quality.ts`: `Q = input prop q` → `ThreeCanvas dpr={Q}` va nuqta shaderlarida `*Q`. Yarim o'lchamli animatik uchun `PROPS='{"q":0.5}' SCALE=0.5`.

## 4. Kod arxitekturasi
```
src/index.ts, Root.tsx          – kompozitsiyalar (id: TestClip2=Ch1, Ch2..Ch6), davomiylik warp.json'dan
src/brand.ts, util.ts, quality.ts, warp.ts, warp.json
src/three/  Nano.tsx (maskot) Sun.tsx SunCut.tsx FX.tsx (StarDust, Haze, Beam, Shockwave) Particles.tsx (PlasmaDust, Halo, Proton, Helium) Studio.tsx glsl.ts
src/ui/     Overlay.tsx (HUD, BigNumber, Subtitle, Footer, FilmFinish) DataUI.tsx (Callout, CompareCard, ReactionCard, SplitBar) LightPath.tsx
src/scenes/ TestClip2.tsx(Ch1) Ch2..Ch6.tsx
render_chunks.mjs  stills.mjs  assemble.sh  finish.sh
sfx_lib.py sfx.py sfx_ch2..ch56.py music.py
align2.py warp_audio.py voice/asr.py
```
**Qoidalar**
- Hamma sahna `useCurrentFrame`ni **`../warp`** dan import qiladi (remotion'dan emas!) — vaqt moslash shu orqali ishlaydi.
- Har bob `T = {...}` ob'ektida kadr kuelarini saqlaydi (undock, fire, dock, number, end...). Tovush skriptlari shu kuelarni **qo'lda** takrorlaydi — ikkalasini birga yangilang.
- Subtitr: `<Subtitle words={[{w,s,key?}...]} out={kadr}/>`, `s` = so'z boshlanish kadri (dizayn vaqtida), `key:true` = aksent rangli raqam/atama. Subtitr bo'laklari 3–6 so'z, `y` footerdan yuqori (1530–1600) — `handleY` va watermark bilan to'qnashmasin.
- Bob oxirida Nano HUD nishoniga qo'nadi (`dock`..`dockEnd`), nishon ikonkasi `hub_icon.png`.
- Birinchi bobda: 0–14 kadr qoradan fade-in; logo → morph → Nano; oxirgi bobda teskari morph (Nano → aniq logo) + kanal nomi + "Obuna" kartasi + qoraga so'nish.

## 5. Nano maskoti (muhim)
Foydalanuvchi talabi: **model logoga ko'zga ko'rinadigan darajada aloqador bo'lsin** (oddiy AI-maskot bo'lmasin).
- Tana = logodagi atom: yaltiroq qora yadro + 0°/60°/120° burchakli 3 ta orbita.
- 4 qo'l = hub chiziqlari, uchida medalyon: DNK, teleskop, kolba, globus (ikonlar logodan kesilgan teksturalar, `useTexture(staticFile('icon_x.png'))`).
- 2 oyoq = tog' ustidagi "A" chiziqlari.
- `morph 0` → logoning aniq joylashuvi (video shu bilan boshlanadi, ikonlar logodagi o'rin va o'lchamda), `morph 1` → personaj. `RAYS`, `tipLocal(i,k)` (nur boshlanadigan nuqta), `limbLen`.
- Medalyon materiali matt, ikon emissive ~0.72→0.32 (morph 0 da oq logo kabi o'qilsin).
- Mavzuga mos medalyon bilan nur otadi: fizika→teleskop, kimyo/reaksiya→kolba, tarix/Yer→globus, biologiya→DNK.

## 6. Ovozni moslash (eng nozik qism — tajribadan)
Muammo: foydalanuvchi skriptni o'z tezligida o'qiydi, animatsiya esa boshqa tezlik uchun yozilgan → subtitr va raqamlar ovozga tushmaydi. Yechim (ishlagan):
1. **Tozalash** (`voice/clean.wav`): `ffmpeg -af "adeclip,highpass=f=75,equalizer=f=220:t=q:w=1.2:g=-2.5,equalizer=f=3200:t=q:w=1:g=2.5,equalizer=f=7500:t=q:w=1.5:g=-2,highshelf=f=9000:g=2,acompressor=threshold=-22dB:ratio=3:attack=8:release=120:makeup=3,alimiter=limit=0.89,loudnorm=I=-16:TP=-1.5:LRA=7"`. Odatiy muammo: telefon/mikrofon yozuvida qirqilish (clipping) va xona aks-sadosi; shovqin odatda yo'q. Foydalanuvchiga: mikrofonni 10–15 sm yaqin, yumshoq (kiyim/yostiq) xonada yozing.
2. **ASR**: `faster-whisper` HF'dan model ololmaydi. **sherpa-onnx** + GitHub release `sherpa-onnx-whisper-small.tar.bz2` (640 MB) ishlaydi (`voice/asr.py` APPENDIX'da). O'zbekcha matn xato (garbled) chiqadi, lekin **gap bloklarini (pauzalar bo'yicha) va qaysi blok qaysi gap ekanini** aniqlashga yetadi. So'z darajasidagi vaqt yo'q.
3. **Bloklar**: energiya (RMS, −38…−40 dB) bo'yicha nutq oraliqlari, <0.18 s bo'shliqlarni to'ldirish, <0.15 s portlashlarni tashlash. Bloklarni skript gruppalariga (subtitr bo'laklari) qo'lda moslang (`align.json: B`).
4. Blok ichida gruppalar vaqti — **bo'g'inlar soniga proporsional** (sonlarni so'z bilan: 8→"sakkiz", 15→"on besh"…). Aniqlik ±0.2–0.3 s.
5. **Warp**: global bo'lakli-chiziqli xarita (chiqish vaqti ↔ dizayn vaqti), faqat blok boshlari bo'yicha ankerlar (har gruppa bo'yicha qilsangiz tezlik sakraydi → jerky). Tezlik 0.55–1.45× oralig'ida bo'lsin; kerak bo'lsa bloklar orasiga **jim pauza qo'shing** (`SH={blokIndeks: soniya}`). Bob chegaralari xaritadan teskari hisoblanadi → har bobning yangi `durationInFrames`i (`warp.json: durations`).
6. `src/warp.ts` — `useCurrentFrame()` chiqish kadrini dizayn kadriga aylantiradi. **Subtitr** esa warp'dan mustaqil: `warp.json: subs["CompId:birinchiSo'zDizaynKadri"] = {s:[chiqish kadrlari], out}` — ovozdagi aniq vaqtda yonadi.
7. **SFX** ham xaritadan o'tadi: `warp_audio.py` har oraliqni `atempo` bilan cho'zadi (zanjirlab 0.5–2 chegarasini aylanib o'tadi) → `out/sfx_warped.wav`. `assemble.sh` shu faylni ishlatadi. Musiqa shunchaki yangi davomiylikda qayta generatsiya (`music.py out/music.wav <soniya>`).
8. Ovoz yo'li: bloklar chiqish vaqtiga qo'yiladi (±0.12 s hoshiya, 20 ms fade) → `voice/voice_out.wav`.
9. Tekshirish: moslashgan videodan bir nechta kadrni (`ffmpeg -ss t`) olib subtitr aytilayotgan so'zda turganini ko'ring.
Agar foydalanuvchi skriptni boshqacha so'zlar bilan o'qisa (masalan "zichki"→"zich"), subtitr matni ham o'qilganiga moslansin.

## 7. Tovush dizayni va yig'ish
- Hammasi 48 kHz, deterministik (`Mix(seed)`), kadr→soniya `fr(f)=f/30`. Primitivlar: `bed, whoosh, click, blip, riser, impact, rumble, chime, ticks, sizzle, tonesweep`, reverb. Har bob SFX fayli, kuelar `T` bilan bir xil.
- Muammo: keng polosali shovqin — bir qutbli filtr o'rniga scipy `butter/sosfilt`, havo-shovqin gain'ini pasaytiring.
- Musiqa: Am–F–C–G ambient pad + 8-lik puls (9-soniyadan kiradi), oxirida sub-swell va A-minor add9 akkord.
- `assemble.sh <prefix> <out.mp4> [voice.wav]`: bob videolarini `concat -c copy`, SFX + musiqa, ovoz bo'lsa musiqa **sidechain duck** (`sidechaincompress`), `loudnorm I=-14 TP=-1`, film finish (eq, vignette, vaqtinchalik grain), `libx264 -preset slow -crf 21 -movflags +faststart`, `aac 192k`.
- Tugagach: `ffmpeg -af ebur128=peak=true` bilan LUFS/peak tekshiring (maqsad ≈ −14 LUFS, TP ≤ −1).

## 8. Render qoidalari (video-making skill bilan mos)
- Bitta mp4 per bo'lak (30 kadr), vaqtinchalik nom `.tmp.mp4` → `ffmpeg` muvaffaqiyatli bo'lgach `rename`. Bo'laklar `concat -c copy` bilan birlashadi. `render_chunks.mjs` **davom ettiriladigan** (mavjud bo'lakni o'tkazadi): `SCALE=0.5 TAG=_w PROPS='{"q":0.5}' node render_chunks.mjs Ch2:w_ch2 TestClip2:w_ch1 ...`.
- To'liq renderdan oldin eng og'ir kadrlarni `stills.mjs` bilan chizib ko'ring: `PROPS='{"q":0.5}' node stills.mjs Ch2 0 60 120 → out/sheet.jpg` (Read bilan ko'ring).
- Faqat ovoz o'zgarsa videoni qayta renderlamang (`-c:v copy`). Faqat bitta bob o'zgarsa — o'sha bobning bo'laklari (TAG o'zgartiring yoki bo'lakni o'chiring).
- Bo'lak nomi: `out/chunks/<Comp><TAG>_<boshKadr 4 xonali>.mp4`. Warp o'zgarsa (davomiylik o'zgaradi) — eski bo'laklar yaroqsiz, yangi TAG bilan boshlang.
- Fonda ishlayotganda foydalanuvchiga **ETA** ayting; tugaganda notification keladi, shunda yig'ib yuboring.

## 9. Ishda uchragan xatolar → yechim
| Muammo | Yechim |
|---|---|
| Kadr ~20 s, juda sekin | SMAA (multisampling emas), backdrop-filter olib tashlash, bloom yengillatish, `q` prop |
| Uzun renderlar timeout/exit 144 | bo'lak-bo'lak, fonda, davom ettiriladigan skript |
| Quyosh yassi/yorug' ortiqcha | shader tone: `col*=1.15*mix(0.45,1.0,limb); col+=vec3(1,.55,.2)*pow(mu,6.)*0.12` |
| Nur "ustun"dek yo'g'on | `Beam` — ingichka harakatlanuvchi bolt (bosh+dum) |
| Subtitr/watermark/kartalar to'qnashishi | `handleY`, Subtitle qisqa bo'laklar va `out`, kamera/callout o'rinlari |
| Logo kesmalarida parchalar | scipy.ndimage bilan chetga tegadigan mayda komponentlarni olib tashlash |
| "Model logoga o'xshamaydi" | Nano v3: logo ikonlaridan yig'ilgan, morph 0 = aniq logo |
| Edit/Write "file modified since read" | qayta o'qing/qayta yozing |
| Ovoz–subtitr mos emas | 6-bo'lim (ASR bloklari + warp + subtitr jadvali) |
| HF/pytorch yuklab bo'lmaydi | GitHub releases (sherpa-onnx) |

## 10. Yangi video uchun qisqa yo'riqnoma (boshqa chatda)
1. Foydalanuvchidan oling: logo rasmi, (ixtiyoriy) andoza videolar, mavzu, ovoz usuli, aksent.
2. APPENDIX'dagi fayllarni yarating, `npm i`, Playwright Chromium yo'lini tekshiring (`ls /opt/pw-browsers`).
3. `public/` ga logo va ikonlarni qo'ying (1-bo'lim).
4. Yangi mavzu uchun: faktlar → skript → `Ch*.tsx` ni nusxa qilib o'zgartiring (matn, raqamlar, 3D ob'ekt, `T` kuelari) → SFX skriptlarini kuelarga moslang.
5. `stills.mjs` bilan tekshiring → yarim o'lchamli animatik → foydalanuvchiga yuboring.
6. Ovozni oling → 6-bo'lim → qayta render (yangi TAG) → `assemble.sh ... voice_out.wav` → yuboring.
7. Yakuniy to'liq sifat renderi (fonda) → `assemble.sh` → yuboring. Foydalanuvchi kanalga o'zi joylaydi.
Sifat mezoni: foydalanuvchi aytgan — "AI yasagani bilinib qolmasin, kamida 9.mp4 kabi". Oddiy 2D shablon bilan to'xtamang: 3D, bloom, glass UI, aniq tovush.

## 11. Ochiq masalalar (oldingi videodan)
- Litsenziyali musiqa o'rniga sintez qilingan bed ishlatilgan; foydalanuvchi javob bermagan.
- To'liq sifatdagi (1080×1920) yakuniy render oldingi chatda boshlanmagan edi.
- Ch1 yuborilgan `nano_test_ch1.mp4` eski maskot bilan; Nano v3 bilan qayta renderlandi (animatikda).
- Shablonni to'liq JSON-boshqariladigan qilish (skript → sahna) hali qilinmagan: hozir har bob alohida `.tsx`.

---
# APPENDIX — manba kodlar
Har bo'lim sarlavhasi fayl yo'li. Qolgan katta fayllar (`Ch2..Ch6.tsx`, `SunCut.tsx`, `FX.tsx`, `DataUI.tsx`, `LightPath.tsx`, `sfx*.py`) uslubi shu yerdagilarga o'xshash; yangi mavzu uchun ularni noldan, yuqoridagi qoidalar bo'yicha yozing.


## FILE: package.json
```json
{
  "name": "nano-video",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "@fontsource/inter-tight": "^5.1.0",
    "@fontsource/jetbrains-mono": "^5.1.1",
    "@fontsource/unbounded": "^5.1.0",
    "@react-three/drei": "^9.114.0",
    "@react-three/fiber": "^8.17.10",
    "@react-three/postprocessing": "^2.16.3",
    "@remotion/bundler": "^4.0.300",
    "@remotion/cli": "^4.0.300",
    "@remotion/motion-blur": "^4.0.300",
    "@remotion/renderer": "^4.0.300",
    "@remotion/three": "^4.0.300",
    "postprocessing": "^6.36.3",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "remotion": "^4.0.300",
    "three": "^0.169.0"
  }
}
```


## FILE: remotion.config.ts
```ts
import {Config} from '@remotion/cli/config';
Config.setBrowserExecutable('/opt/pw-browsers/chromium-1243/chrome-linux64/chrome');
Config.setChromiumOpenGlRenderer('swangle');
Config.setConcurrency(2);
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
```


## FILE: src/index.ts
```ts
import {registerRoot} from 'remotion';
import {RemotionRoot} from './Root';
registerRoot(RemotionRoot);
```


## FILE: src/Root.tsx
```tsx
import W from './warp.json';
import React from 'react';
import {Composition} from 'remotion';
import {GLTest} from './scenes/GLTest';
import {LookDev} from './scenes/LookDev';
import {TestClip} from './scenes/TestClip';
import {LookDev2} from './scenes/LookDev2';
import {TestClip2} from './scenes/TestClip2';
import {Ch2} from './scenes/Ch2';
import {Ch3} from './scenes/Ch3';
import {Ch4} from './scenes/Ch4';
import {Ch5} from './scenes/Ch5';
import {Ch6} from './scenes/Ch6';
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="GLTest" component={GLTest} durationInFrames={30} fps={30} width={1080} height={1920} />
    <Composition id="LookDev" component={LookDev} durationInFrames={30} fps={30} width={1080} height={1920} />
    <Composition id="TestClip" component={TestClip} durationInFrames={270} fps={30} width={1080} height={1920} />
    <Composition id="LookDev2" component={LookDev2} durationInFrames={4} fps={30} width={1080} height={1920} />
    <Composition id="TestClip2" component={TestClip2} durationInFrames={(W as any).durations?.TestClip2 ?? 300} fps={30} width={1080} height={1920} />
    <Composition id="Ch2" component={Ch2} durationInFrames={(W as any).durations?.Ch2 ?? 300} fps={30} width={1080} height={1920} />
    <Composition id="Ch3" component={Ch3} durationInFrames={(W as any).durations?.Ch3 ?? 270} fps={30} width={1080} height={1920} />
    <Composition id="Ch4" component={Ch4} durationInFrames={(W as any).durations?.Ch4 ?? 240} fps={30} width={1080} height={1920} />
    <Composition id="Ch5" component={Ch5} durationInFrames={(W as any).durations?.Ch5 ?? 300} fps={30} width={1080} height={1920} />
    <Composition id="Ch6" component={Ch6} durationInFrames={(W as any).durations?.Ch6 ?? 300} fps={30} width={1080} height={1920} />
  </>
);
```


## FILE: src/brand.ts
```ts
// Brand tokens — Science | MuhammadYusuf (@nano_scientist)
export const brand = {
  bg: '#07090D',
  bg2: '#0D1118',
  ink: '#F2F0EB',      // warm white (logo white)
  dim: 'rgba(242,240,235,0.45)',
  line: 'rgba(242,240,235,0.14)',
  handle: '@nano_scientist',
  series: 'SCIENCE',
};
// accent per topic — base stays black/white
export const accents = {
  sun: {main: '#FFB547', hot: '#FFE2A8', deep: '#E8590C'},
  bio: {main: '#5BE3A6', hot: '#C9FFE6', deep: '#0E9F6E'},
  space: {main: '#9B8CFF', hot: '#E0DBFF', deep: '#5B3FD9'},
  water: {main: '#46D3F0', hot: '#C8F5FF', deep: '#0B7FA6'},
};
export type Accent = typeof accents.sun;
```


## FILE: src/util.ts
```ts
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
```


## FILE: src/quality.ts
```ts
import {getInputProps} from 'remotion';
// render quality: 3D backing-store scale (1 = full 1080×1920, 0.5 = animatic). Pass --props '{"q":0.5}'
export const Q: number = +((getInputProps() as any).q ?? 1);
```


## FILE: src/warp.ts
```ts
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
```


## FILE: src/three/Nano.tsx
```tsx
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
```


## FILE: src/three/Sun.tsx
```tsx
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {SNOISE} from './glsl';

export const sunVS = /* glsl */ `
varying vec3 vN; varying vec3 vP; varying vec3 vView;
void main(){ vN=normalize(normalMatrix*normal); vP=position; vec4 mv=modelViewMatrix*vec4(position,1.); vView=normalize(-mv.xyz); gl_Position=projectionMatrix*mv; }`;
export const sunFS = /* glsl */ `
uniform float uTime; uniform float uHeat; uniform float uOpacity;
varying vec3 vN; varying vec3 vP; varying vec3 vView;
${SNOISE}
void main(){
  vec3 p = normalize(vP);
  // granulation: cells with dark intergranular lanes
  float g1 = snoise(p*64.0 + vec3(0., uTime*0.08, uTime*0.05));
  float g2 = snoise(p*150.0 - vec3(uTime*0.12, 0., uTime*0.1));
  float gran = 1.0 - pow(abs(g1*0.75 + g2*0.25), 0.35);
  // supergranulation + active regions
  float big = fbm(p*4.0 + vec3(uTime*0.02));
  float spots = smoothstep(0.62, 0.78, fbm(p*2.2 + 11.3));
  float mu = clamp(dot(normalize(vN), normalize(vView)), 0.0, 1.0);
  float limb = pow(mu, 0.9);               // strong limb darkening (real photosphere)
  float t = clamp(0.25 + 0.45*gran + 0.35*big, 0.0, 1.2);
  t *= 1.0 - spots*0.8;
  vec3 deep = vec3(0.35, 0.04, 0.0);
  vec3 red = vec3(0.85, 0.16, 0.01);
  vec3 orange = vec3(1.0, 0.42, 0.05);
  vec3 gold = vec3(1.0, 0.68, 0.22);
  vec3 col = mix(deep, red, smoothstep(0.0, 0.3, t));
  col = mix(col, orange, smoothstep(0.3, 0.65, t));
  col = mix(col, gold, smoothstep(0.7, 1.05, t));
  col *= mix(0.25, 1.0, limb);
  col = mix(col, vec3(0.6,0.08,0.0)*0.5, (1.0-limb)*0.5);
  col += vec3(1.0,0.5,0.1) * smoothstep(0.55,0.9,big) * pow(1.0-mu,2.0) * 0.5;
  col *= 1.15*mix(0.45,1.0,limb);
  col += vec3(1.0,0.55,0.2)*pow(mu,6.0)*0.12;
  gl_FragColor = vec4(col * (1.0 + uHeat*1.6), uOpacity);
}`;

export const coronaFS = /* glsl */ `
uniform float uTime; uniform float uOpacity; uniform float uR; varying vec2 vUv;
${SNOISE}
void main(){
  vec2 c = vUv*2.0-1.0; float d = length(c); float a = atan(c.y, c.x);
  float rays = 0.55 + 0.45*snoise(vec3(cos(a)*3.0, sin(a)*3.0, uTime*0.15 + d*1.5));
  rays *= 0.6 + 0.4*snoise(vec3(cos(a)*9.0, sin(a)*9.0, uTime*0.2));
  float x = max(0.0, d - uR);
  float glow = exp(-x*8.0)*0.35 + exp(-x*2.6)*0.18*rays + exp(-x*30.0)*0.35;
  glow *= smoothstep(uR*0.92, uR*1.0, d);
  vec3 col = mix(vec3(0.9,0.22,0.02), vec3(1.0,0.5,0.12), exp(-x*14.0));
  gl_FragColor = vec4(col*glow*1.1*uOpacity, glow*uOpacity);
}`;

export const Sun: React.FC<{position: [number, number, number]; radius: number; scale: number; time: number; heat: number; opacity?: number}> = ({position, radius, scale, time, heat, opacity = 1}) => {
  const camera = useThree((s) => s.camera);
  const mat = useMemo(() => new THREE.ShaderMaterial({uniforms: {uTime: {value: 0}, uHeat: {value: 0}, uOpacity: {value: 1}}, vertexShader: sunVS, fragmentShader: sunFS, transparent: true}), []);
  const cor = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {uTime: {value: 0}, uOpacity: {value: 1}, uR: {value: 0.33}}, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`, fragmentShader: coronaFS,
  }), []);
  mat.uniforms.uTime.value = time; mat.uniforms.uHeat.value = heat; mat.uniforms.uOpacity.value = opacity;
  cor.uniforms.uTime.value = time; cor.uniforms.uOpacity.value = opacity;
  const q = camera.quaternion.clone();
  return (
    <group position={position} scale={scale}>
      <mesh material={mat} rotation={[0.3, time * 0.02, 0.1]}><sphereGeometry args={[radius, 160, 160]} /></mesh>
      <mesh material={cor} quaternion={q} renderOrder={-1}><planeGeometry args={[radius * 6, radius * 6]} /></mesh>
    </group>
  );
};
```


## FILE: src/three/glsl.ts
```ts
// Ashima Arts 3D simplex noise (MIT) + fbm helpers
export const SNOISE = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z); vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
float fbm(vec3 p){ float a=0.5, s=0.0; for(int i=0;i<5;i++){ s+=a*snoise(p); p*=2.03; a*=0.5; } return s; }
`;
```


## FILE: src/three/Particles.tsx
```tsx
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
```


## FILE: src/ui/Overlay.tsx
```tsx
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
```


## FILE: render_chunks.mjs
```js
// Resumable chunked render: node render_chunks.mjs Comp1[:out1] Comp2[:out2] ...
// Renders 30-frame chunks into out/chunks/<Comp>_<start>.mp4 (skips existing), then concatenates → out/<out>.mp4
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import {execSync} from 'child_process';
import fs from 'fs';

const CH = 30;
const SCALE = +(process.env.SCALE || 1); const inputProps = JSON.parse(process.env.PROPS || '{}'); const TAG = process.env.TAG || '';
const opts = {browserExecutable: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', chromiumOptions: {gl: 'swangle'}};
fs.mkdirSync('out/chunks', {recursive: true});
const serveUrl = await bundle({entryPoint: './src/index.ts'});
for (const arg of process.argv.slice(2)) {
  const [id, outName = id] = arg.split(':');
  const composition = await selectComposition({serveUrl, id, inputProps, ...opts});
  const files = [];
  for (let s = 0; s < composition.durationInFrames; s += CH) {
    const e = Math.min(composition.durationInFrames - 1, s + CH - 1);
    const file = `out/chunks/${id}${TAG}_${String(s).padStart(4, '0')}.mp4`;
    files.push(file);
    if (fs.existsSync(file)) continue;
    const t = Date.now();
    await renderMedia({serveUrl, composition, codec: 'h264', crf: 12, frameRange: [s, e], outputLocation: file + '.tmp.mp4', concurrency: 2, timeoutInMilliseconds: 240000, muted: true, scale: SCALE, inputProps, ...opts});
    fs.renameSync(file + '.tmp.mp4', file);
    console.log(`${id} ${s}-${e} ${((Date.now() - t) / 1000).toFixed(0)}s`);
  }
  fs.writeFileSync(`out/chunks/${id}${TAG}.txt`, files.map((f) => `file '${f.replace('out/chunks/', '')}'`).join('\n'));
  execSync(`ffmpeg -v error -y -f concat -safe 0 -i out/chunks/${id}${TAG}.txt -c copy out/${outName}.mp4`);
  console.log(`DONE ${id} → out/${outName}.mp4`);
}
console.log('ALL DONE');
```


## FILE: stills.mjs
```js
// node stills.mjs Comp f1 f2 ...  → out/sheet.jpg (bundles once)
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {execSync} from 'child_process';
const [comp, ...frames] = process.argv.slice(2);
const inputProps = JSON.parse(process.env.PROPS||'{}');
const serveUrl = await bundle({entryPoint: './src/index.ts'});
const opts = {browserExecutable: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', chromiumOptions: {gl: 'swangle'}};
const composition = await selectComposition({serveUrl, id: comp, inputProps, ...opts});
execSync('rm -f out/s_*.jpg');
for (const f of frames) {
  const t = Date.now();
  await renderStill({serveUrl, composition, frame: +f, inputProps, output: `out/s_${String(f).padStart(4, '0')}.jpg`, imageFormat: 'jpeg', jpegQuality: 92, ...opts});
  console.log(f, ((Date.now() - t) / 1000).toFixed(1) + 's');
}
execSync(`python3 -c "
import glob; from PIL import Image, ImageDraw
fs=sorted(glob.glob('out/s_*.jpg')); n=len(fs); cols=min(5,n); rows=(n+cols-1)//cols
o=Image.new('RGB',(cols*432,rows*768))
for i,f in enumerate(fs):
  im=Image.open(f).resize((432,768)); ImageDraw.Draw(im).text((10,740),f.split('_')[1][:4],fill=(255,0,0)); o.paste(im,((i%cols)*432,(i//cols)*768))
o.save('out/sheet.jpg')"`);
```


## FILE: assemble.sh
```bash
#!/bin/bash
# assemble.sh <video prefix e.g. a_ch> <out.mp4> [voice.wav]
# concat chapter videos, concat chapter SFX, mix with music bed (ducked under voice if given), loudness -14 LUFS, film finish
set -e
P=$1; OUT=$2; VOICE=$3
cd "$(dirname "$0")"
printf "file '%s'\n" $(for i in 1 2 3 4 5 6; do echo "${P}${i}.mp4"; done) > out/concat_v.txt
sed -i "s#file '#file '$(pwd)/out/#" out/concat_v.txt
ffmpeg -v error -y -f concat -safe 0 -i out/concat_v.txt -c copy out/_v.mp4
if [ -f out/sfx_warped.wav ]; then cp out/sfx_warped.wav out/_sfx.wav; else
ffmpeg -v error -y -i out/sfx.wav -i out/sfx_ch2.wav -i out/sfx_ch3.wav -i out/sfx_ch4.wav -i out/sfx_ch5.wav -i out/sfx_ch6.wav \
  -filter_complex "[0][1][2][3][4][5]concat=n=6:v=0:a=1[a]" -map "[a]" out/_sfx.wav; fi
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 out/_v.mp4)
if [ -n "$VOICE" ]; then
  MIX="[1:a]volume=0.9[s];[2:a]volume=0.3[mu];[3:a]volume=1.0,asplit[vo][vk];[mu][vk]sidechaincompress=threshold=0.05:ratio=6:attack=20:release=400[mud];[s][mud][vo]amix=inputs=3:normalize=0,loudnorm=I=-14:TP=-1:LRA=9[a]"
  IN3="-i $VOICE"
else
  MIX="[1:a]volume=1.0[s];[2:a]volume=0.38[mu];[s][mu]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1:LRA=9[a]"
  IN3=""
fi
ffmpeg -v error -y -i out/_v.mp4 -i out/_sfx.wav -i out/music.wav $IN3 \
  -filter_complex "[0:v]format=yuv444p,eq=contrast=1.04:saturation=1.06:gamma=0.98,vignette=angle=PI/4.6:mode=forward,noise=c0s=5:c0f=t+u:c1s=3:c1f=t+u:c2s=3:c2f=t+u,format=yuv420p[v];$MIX" \
  -map "[v]" -map "[a]" -t "$DUR" -c:v libx264 -preset slow -crf 21 -profile:v high -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 192k "$OUT"
echo done "$OUT" "$DUR"s
```


## FILE: finish.sh
```bash
#!/bin/bash
# finish.sh raw.mp4 audio.wav out.mp4 — film finish (grain + vignette + gentle grade) and mux audio
set -e
ffmpeg -v error -y -i "$1" -i "$2" \
  -filter_complex "[0:v]format=yuv444p,eq=contrast=1.04:saturation=1.06:gamma=0.98,vignette=angle=PI/4.6:mode=forward,noise=c0s=5:c0f=t+u:c1s=3:c1f=t+u:c2s=3:c2f=t+u,format=yuv420p[v]" \
  -map "[v]" -map 1:a -c:v libx264 -preset slow -crf 21 -profile:v high -pix_fmt yuv420p -movflags +faststart \
  -c:a aac -b:a 192k -shortest "$3"
echo done "$3"
```


## FILE: align2.py
```python
import json, re, subprocess, numpy as np, scipy.io.wavfile as wv
A=json.load(open('voice/align.json')); B=A['B']; vst=A['vst']; Dst=A['Dst']
SH={2:1.2,7:0.8}                          # silence (s) inserted before these blocks to keep animation speed sane
sh=0; blocks=[]
for i,(a,b,gl) in enumerate(B):
    sh+=SH.get(i,0); blocks.append((a,b,gl,sh))
o=lambda v,s:v+s
# group out start times
gout={}
for a,b,gl,s in blocks:
    for g in gl: gout[g]=vst[g]+s
gend={}
for a,b,gl,s in blocks:
    for k,g in enumerate(gl): gend[g]=(gout[gl[k+1]] if k+1<len(gl) else b+s)
tail=2.6
END=blocks[-1][1]+blocks[-1][3]+tail
anch=[(0.0,0.0)]+[(blocks[i][0]+blocks[i][3],Dst[blocks[i][2][0]]) for i in range(len(B))]+[(END,57.0)]
# also add block-internal anchors none (block level only)
for (o0,d0),(o1,d1) in zip(anch,anch[1:]): print(round(o0,2),round(d0,2),'speed',round((d1-d0)/(o1-o0),2))
def D(t):
    for (o0,d0),(o1,d1) in zip(anch,anch[1:]):
        if t<=o1: return d0+(t-o0)*(d1-d0)/(o1-o0)
    return 57.0
def O(d):
    for (o0,d0),(o1,d1) in zip(anch,anch[1:]):
        if d<=d1: return o0+(d-d0)*(o1-o0)/(d1-d0)
    return END
chs=[('TestClip2',0,300),('Ch2',10,300),('Ch3',20,270),('Ch4',29,240),('Ch5',37,300),('Ch6',47,300)]
bounds=[round(30*O(d))for d in [0,10,20,29,37,47]]+[round(30*END)]
W={'anchors':{},'durations':{},'subs':{}}
for k,(cid,dc,dl) in enumerate(chs):
    F0,F1=bounds[k],bounds[k+1]; W['durations'][cid]=F1-F0
    pts=[(0.0,0.0)]
    for oo,dd in anch:
        tau=30*oo-F0; fd=30*(dd-dc)
        if 0<tau<F1-F0 and 0<fd<dl: pts.append((tau,fd))
    pts.append((float(F1-F0),float(dl)))
    W['anchors'][cid]=pts
# subtitles: first-word design frame -> output-local frames
import sys
G=json.load(open('voice/groups.json'))      # list of [chapter_id, off, [(w,s)...]]
vw={}
for gi,(cid,off,ws) in enumerate(G):
    sy=[max(1,len(re.findall(r"[aeiou]",w.lower()))) for w,_ in ws]
    t0,t1=gout[gi],gend[gi]; tot=sum(sy); c=0; st=[]
    for n in sy: st.append(t0+(t1-t0)*c/tot); c+=n
    k=[x[0] for x in chs].index(cid); F0=bounds[k]
    W['subs'][f"{cid}:{ws[0][1]}"]={'s':[round(30*x-F0,1) for x in st],'out':round(30*(t1-0.05)-F0,1)}
json.dump(W,open('src/warp.json','w'))
json.dump({'anch':anch,'blocks':[(a,b,s) for a,b,gl,s in blocks],'END':END},open('voice/plan.json','w'))
# ---- voice track
sr,x=wv.read('voice/clean.wav'); x=x.astype(np.float32)/32768
out=np.zeros(int((END+0.5)*sr),np.float32)
for a,b,gl,s in blocks:
    i0=int((a-0.12)*sr); i1=int((b+0.15)*sr); seg=x[i0:i1].copy()
    n=int(0.02*sr); seg[:n]*=np.linspace(0,1,n); seg[-n:]*=np.linspace(1,0,n)
    j=int((a+s-0.12)*sr); out[j:j+len(seg)]+=seg
wv.write('voice/voice_out.wav',sr,(np.clip(out,-1,1)*32767).astype(np.int16))
print('END',END,'bounds',bounds,W['durations'])
```


## FILE: warp_audio.py
```python
import json, subprocess, numpy as np, scipy.io.wavfile as wv, os
P=json.load(open('voice/plan.json')); anch=P['anch']; END=P['END']
subprocess.run("ffmpeg -v error -y -i out/sfx.wav -i out/sfx_ch2.wav -i out/sfx_ch3.wav -i out/sfx_ch4.wav -i out/sfx_ch5.wav -i out/sfx_ch6.wav -filter_complex '[0][1][2][3][4][5]concat=n=6:v=0:a=1[a]' -map '[a]' -ar 48000 voice/sfx_design.wav",shell=True,check=True)
sr,x=wv.read('voice/sfx_design.wav'); x=x.astype(np.float32)/32768
if x.ndim>1: pass
os.makedirs('voice/seg',exist_ok=True); parts=[]
for k,((o0,d0),(o1,d1)) in enumerate(zip(anch,anch[1:])):
    seg=x[int(d0*sr):int(d1*sr)]
    fn=f'voice/seg/s{k}.wav'; wv.write(fn,sr,(seg*32767).astype(np.int16))
    tempo=(d1-d0)/(o1-o0); chain=[]; t=tempo
    while t>2: chain.append(2.0); t/=2
    while t<0.5: chain.append(0.5); t/=0.5
    chain.append(t)
    af=','.join(f'atempo={c:.5f}' for c in chain)
    subprocess.run(f"ffmpeg -v error -y -i {fn} -af '{af}' -ar 48000 -ac {1 if seg.ndim==1 else seg.shape[1]} voice/seg/t{k}.wav",shell=True,check=True)
    parts.append(f'voice/seg/t{k}.wav')
inputs=' '.join(f'-i {p}' for p in parts)
subprocess.run(f"ffmpeg -v error -y {inputs} -filter_complex 'concat=n={len(parts)}:v=0:a=1' -ar 48000 out/sfx_warped.wav",shell=True,check=True)
print('ok',END)
```


## FILE: voice/asr.py
```python
import sherpa_onnx, numpy as np, scipy.io.wavfile as wv, scipy.signal as sg, json
d='sherpa-onnx-whisper-small/'
r=sherpa_onnx.OfflineRecognizer.from_whisper(encoder=d+'small-encoder.int8.onnx',decoder=d+'small-decoder.int8.onnx',tokens=d+'small-tokens.txt',language='uz',task='transcribe',num_threads=4)
sr,x=wv.read('clean.wav'); x=x.astype(np.float32)/32768
h=480;n=len(x)//h;db=20*np.log10(np.sqrt((x[:n*h].reshape(n,h)**2).mean(1))+1e-9);act=db>-40
segs=[];i=0
while i<n:
    if act[i]:
        j=i
        while j<n and act[j:j+12].any(): j+=1
        if j-i>=15: segs.append((i*.01,j*.01))
        i=j
    else: i+=1
out=[]
for a,b in segs:
    y=sg.resample_poly(x[int(max(0,a-.1)*sr):int((b+.1)*sr)],1,3)
    s=r.create_stream(); s.accept_waveform(16000,y); r.decode_stream(s)
    print(round(a,2),round(b,2),s.result.text); out.append((a,b,s.result.text))
json.dump(out,open('asr.json','w'),ensure_ascii=False)
```


## FILE: sfx_lib.py
```python
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
```


## FILE: music.py
```python
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
```


## FILE: sfx_ch56.py
```python
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
```


## FILE: voice/make_groups.py  (align2.py dan OLDIN ishga tushiring: sahnalardagi Subtitle'lardan groups.json)
```python
import re, json
chs = ['TestClip2', 'Ch2', 'Ch3', 'Ch4', 'Ch5', 'Ch6']
G = []
for cid in chs:
    s = open(f'src/scenes/{cid}.tsx').read()
    for m in re.finditer(r"<Subtitle[^>]*?words=\{\[(.*?)\]\}\s*/>", s, re.S):
        ws = [(w[1:-1], int(b)) for w, b in re.findall(r"\{w: ('[^']*'|\"[^\"]*\"), s: (\d+)", m.group(1))]
        G.append([cid, 0, ws])          # tartib = ovozdagi gap tartibi
json.dump(G, open('voice/groups.json', 'w'), ensure_ascii=False)
```

## FILE: voice/make_align.py  (align.json: ovoz bloklari -> gruppalar, bo'g'inlar bo'yicha vaqt)
```python
import re, json
G = json.load(open('voice/groups.json'))
# Bloklar: (boshlanish_s, tugash_s, [gruppa indekslari]) — ASR/energiya bo'yicha aniqlangan nutq oraliqlari (clean.wav vaqti)
B = [...]   # <-- har video uchun qo'lda to'ldiriladi (asr.py chiqishiga qarab)
num = {'8':'sakkiz','20':'yigirma','15':'on besh','150':'bir yuz ellik','600':'olti yuz','4':'tort','700':'yetti yuz','170':'bir yuz yetmish'}   # raqamlarni so'z qilib bo'g'in sanash
syl = lambda w: max(1, len(re.findall(r"[aeiou]", num.get(w, w).lower())))
gs  = [sum(syl(w) for w, _ in ws) for _, _, ws in G]
Dst = [off + ws[0][1] / 30 for cid, off, ws in G]      # off = bobning dizayn boshlanishi (s): 0,10,20,29,37,47 — loyihaga qarab!
vst = [None] * len(G)
for a, b, gl in B:
    tot = sum(gs[g] for g in gl); c = 0
    for g in gl: vst[g] = a + (b - a) * c / tot; c += gs[g]
json.dump({'B': B, 'vst': vst, 'Dst': Dst}, open('voice/align.json', 'w'))
# tezlik ko'rigi: (Dst[i+1]-Dst[i]) / (vst[i+1]-vst[i])  -> 0.55..1.45 oralig'ida bo'lsin
```
**Eslatma:** `align2.py` ichida `groups.json` dagi `off` 0 turadi va bob dizayn boshlanishlari `chs`/`bounds` ro'yxatida qattiq yozilgan (`[0,10,20,29,37,47]`, kadrlar `300,300,270,240,300,300`); yangi videoda shularni yangilang. `make_groups.py` `off`ni to'ldirmaydi — `make_align.py` dagi `Dst` uchun bob offsetlarini qo'lda bering.
