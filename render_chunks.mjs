// Resumable chunked render: node render_chunks.mjs Comp1[:out1] Comp2[:out2] ...
// Renders 30-frame chunks into out/chunks/<Comp>_<start>.mp4 (skips existing), then concatenates → out/<out>.mp4
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import {execSync} from 'child_process';
import fs from 'fs';

const CH = 30;
const SCALE = +(process.env.SCALE || 1); const inputProps = JSON.parse(process.env.PROPS || '{}'); const TAG = process.env.TAG || '';
const opts = {chromiumOptions: {gl: process.env.REMOTION_GL || 'angle'}, ...(process.env.REMOTION_BROWSER ? {browserExecutable: process.env.REMOTION_BROWSER} : {})};
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
