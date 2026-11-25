import numpy as np, json
a=np.fromfile("voice16k.f32",dtype=np.float32); sr=16000; hop=160
n=len(a)//hop; fr=a[:n*hop].reshape(n,hop)
db=10*np.log10((fr**2).mean(1)+1e-12)
ref=np.percentile(db,95); thr=ref-38
sp=db>thr
# smooth: close gaps <0.12s (keep pauses >=0.12 so we can decide), remove blips <0.05
def runs(b):
    r=[];s=None
    for i,v in enumerate(b):
        if v and s is None:s=i
        if not v and s is not None:r.append([s,i]);s=None
    if s is not None:r.append([s,len(b)])
    return r
R=runs(sp); R=[x for x in R if x[1]-x[0]>=5]
M=[R[0]]
for s,e in R[1:]:
    if s-M[-1][1]<12: M[-1][1]=e
    else: M.append([s,e])
segs=[[s/100,e/100] for s,e in M]
pauses=[[segs[i][1],segs[i+1][0]] for i in range(len(segs)-1)]
big=[p for p in pauses if p[1]-p[0]>0.35]
print("thr",thr,"speech segs",len(segs),"pauses>0.35",len(big), "dur",len(a)/sr)
json.dump({"speech":segs,"pauses":big},open("vad.json","w"))
# compare intro (first 25s) vs rest: rms & spectral centroid & f0-ish
def stats(x):
    X=np.abs(np.fft.rfft(x.reshape(-1,1024)*np.hanning(1024),axis=1))
    f=np.fft.rfftfreq(1024,1/sr); e=X.sum(1); m=e>np.percentile(e,50)
    cen=(X[m]*f).sum(1)/X[m].sum(1)
    lo=X[m][:,(f>80)&(f<300)].sum()/X[m].sum()
    return 20*np.log10(np.sqrt((x[np.abs(x)>0.01]**2).mean())), cen.mean(), lo
k=lambda t0,t1: a[int(t0*sr):int(t1*sr)][:((int(t1*sr)-int(t0*sr))//1024)*1024]
for name,(t0,t1) in {"intro 0-25s":(0,25),"25-120":(25,120),"120-250":(120,250),"250-fin":(250,len(a)/sr-1)}.items():
    print(name, ["%.2f"%v for v in stats(k(t0,t1))])
