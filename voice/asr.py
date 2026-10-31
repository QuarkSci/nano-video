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
