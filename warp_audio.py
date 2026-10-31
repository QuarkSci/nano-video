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
