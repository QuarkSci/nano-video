// node stills.mjs Comp f1 f2 ...  → out/sheet.jpg (bundles once)
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {execSync} from 'child_process';
const [comp, ...frames] = process.argv.slice(2);
const inputProps = JSON.parse(process.env.PROPS||'{}');
const serveUrl = await bundle({entryPoint: './src/index.ts'});
const opts = {chromiumOptions: {gl: process.env.REMOTION_GL || 'angle'}, ...(process.env.REMOTION_BROWSER ? {browserExecutable: process.env.REMOTION_BROWSER} : {})};
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
