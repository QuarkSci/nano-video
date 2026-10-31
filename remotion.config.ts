import {Config} from '@remotion/cli/config';
// Lokal kompyuter: hech narsa sozlamang — Remotion Chrome'ni o'zi yuklaydi, GPU ishlatiladi ('angle').
// Claude sandbox (GPU yo'q): REMOTION_BROWSER=/opt/pw-browsers/chromium-*/chrome-linux64/chrome REMOTION_GL=swangle
if (process.env.REMOTION_BROWSER) Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
Config.setChromiumOpenGlRenderer((process.env.REMOTION_GL ?? 'angle') as any);
Config.setConcurrency(Number(process.env.REMOTION_CONCURRENCY ?? 2));
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
