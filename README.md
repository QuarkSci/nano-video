# nano-video — Science | MuhammadYusuf (@nano_scientist)
9:16 animatsion-ilmiy video shabloni: Remotion 4 + Three.js, 3D maskot Nano, ovoz bilan vaqt moslash (warp), sintez tovush.

## Kengash
Rais = foydalanuvchi · CEO = Claude (`CLAUDE.md`, `.claude/skills/nano-video`) · Manager = Antigravity (`AGENTS.md`, `.agents/skills/nano-ops`) · Tadqiqot = Gemini Deep Research / AI Studio.
Topshirma fayllar orqali: `handoff/T-NNN.md` → `handoff/T-NNN.result.md`.

## Lokal ishga tushirish
```bash
npm i
npx remotion studio                      # animatikni ko'rish (Claude'ga stills yuborish shart emas)
SCALE=0.5 TAG=_w PROPS='{"q":0.5}' node render_chunks.mjs Ch2:w_ch2   # animatik render
```
Sandbox (GPU'siz): `REMOTION_GL=swangle REMOTION_BROWSER=<chrome yo'li>`.

## Claude Code → Antigravity ulanishi
1. Bir marta kiring: terminalda `agy` (Google AI Pro hisobi bilan; print rejimida login qilib bo'lmaydi).
2. Sinov: `agy -p "reply with exactly: OK"`.
3. Claude Code `Bash` orqali `agy -p "<vazifa>"` chaqiradi. Chiqish bo'sh qolsa: `agy` stdout'ni faqat terminalda beradi (upstream bug), MCP/bridge o'ramasidan foydalaning: `claude mcp add antigravity-cli uvx antigravity-cli-mcp-slim` (uchinchi tomon paketi: avval kodini o'qing).
4. Ulanmasa ham ishlaydi: Claude `handoff/T-NNN.md` yozadi, siz Antigravity'ga "T-NNN ni bajar" deysiz.

## Repo'da yo'q narsalar
Sahnalar (`src/scenes/*`), `DataUI/LightPath/FX/SunCut/Studio`, `sfx_ch2..4`, `warp.json`, `public/` aktivlari. Birinchi vazifa: JSON-boshqariladigan shablon bilan tiklash (`SKILL.md` oxiriga qarang). Shu sababli `Root.tsx` hozir kompilyatsiya bo'lmaydi.
