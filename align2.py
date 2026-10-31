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
