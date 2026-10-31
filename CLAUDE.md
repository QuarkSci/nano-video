# CLAUDE.md — Nano video (Claude = CEO)
Til: o'zbekcha, qisqa, amaliy. Birinchi `.claude/skills/nano-video/SKILL.md` ni o'qi; `docs/PLAYBOOK_FULL.md` ni faqat zarur bo'lsa och (katta).

## Token qoidalari
- Kodni qayta yozma: bor faylni o'qi va Edit qil. Yangi chatda `src/` ni noldan tiklama.
- Faylni butunlay qayta o'qima; `Read` offset/limit yoki grep.
- `stills.mjs`: bob boshiga ko'pi bilan 3 kadr. Animatikni foydalanuvchi `npx remotion studio` da o'zi ko'radi.
- Uzoq renderni kuzatma: lokal, bo'lak-bo'lak; foydalanuvchi yoki agy ishga tushiradi.
- Sonnet yetarli, Opus faqat yangi murakkab 3D/shader uchun. Bir chat = bir bob.

## Vazifa topshirish (Antigravity = manager)
Mexanik/lokal ishlar (SFX/music skript, npm/render/assemble ishga tushirish, matn almashtirish) uchun `handoff/T-NNN.md` yoz (`TASK_TEMPLATE.md`), so'ng `agy -p "handoff/T-NNN.md dagi vazifani bajar"` yoki foydalanuvchiga ber. Faqat `handoff/T-NNN.result.md` va `git diff` ni o'qi.
O'zingda qoladi: skript, sahna dizayni, 3D/shader, warp mantig'i, faktlar tekshiruvi, review.

## Chegara
Foydalanuvchi tasdig'isiz: yakuniy render, `git push`, fayl o'chirish.
