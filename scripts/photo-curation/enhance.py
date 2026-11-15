import numpy as np, io, json, sys, os
from PIL import Image, ImageFilter
def analyze_and_fix(im):
    a=np.asarray(im.convert('RGB')).astype(np.float32)/255
    L=0.2126*a[...,0]+0.7152*a[...,1]+0.0722*a[...,2]
    ops={}
    lo,hi=np.percentile(L,0.5),np.percentile(L,99.5)
    nlo=min(max(lo-0.01,0),0.05) if lo>0.03 else 0.0
    nhi=hi if hi<0.95 else 1.0
    nhi=max(nhi, (1.0-nlo)/1.15+nlo)  # cap gain 1.15
    if (nhi-nlo)<0.96 or nlo>=0.02:
        a=np.clip((a-nlo)/(nhi-nlo),0,1); ops['levels']=[round(float(nlo),3),round(float(nhi),3)]
    L=0.2126*a[...,0]+0.7152*a[...,1]+0.0722*a[...,2]
    med=float(np.median(L))
    if med<0.36:
        g=float(np.clip(np.log(0.42)/np.log(max(med,1e-3)),0.82,1.0))
        if g<0.98: a=a**g; ops['gamma']=round(g,3)
    mx=a.max(-1); mn=a.min(-1); sat=(mx-mn)/np.maximum(mx,1e-3)
    L=0.2126*a[...,0]+0.7152*a[...,1]+0.0722*a[...,2]
    m=(sat<0.12)&(L>0.25)&(L<0.9)
    if m.mean()>0.08:
        means=a[m].mean(0); gray=means.mean()
        gains=np.clip(1+0.6*(gray/means-1),0.96,1.04)
        if np.abs(gains-1).max()>0.015:
            a=np.clip(a*gains,0,1); ops['wb']=[round(float(x),3) for x in gains]
    if not ops: return None, ops
    out=Image.fromarray((a*255+0.5).astype(np.uint8),'RGB')
    out=out.filter(ImageFilter.UnsharpMask(radius=0.8,percent=25,threshold=4)); ops['sharpen']=True
    return out, ops

def save_like(out, src, path):
    kw=dict(format='JPEG',optimize=True,progressive=True)
    if src.info.get('icc_profile'): kw['icc_profile']=src.info['icc_profile']
    ex=src.info.get('exif')
    if ex: kw['exif']=ex
    orig=os.path.getsize(path)
    b=io.BytesIO()
    try: out.save(b,qtables=src.quantization,subsampling=__import__('PIL.JpegImagePlugin',fromlist=['x']).get_sampling(src),**kw); q='keep'
    except Exception:
        b=io.BytesIO(); out.save(b,quality=85,**kw); q=85
    return b.getvalue(), q

def process(path, write=False, outpath=None):
    src=Image.open(path)
    if src.format!='JPEG' or src.mode not in ('RGB','L'): return dict(path=path, skipped='format')
    if src.mode=='L': return dict(path=path, skipped='gray')
    out,ops=analyze_and_fix(src)
    if out is None: return dict(path=path, ops={})
    before=os.path.getsize(path)
    data,q=save_like(out,src,path)
    if write: open(outpath or path,'wb').write(data)
    return dict(path=path, ops=ops, q=q, before=before, after=len(data))
