import json, re, hashlib, sys, os
import numpy as np
from PIL import Image, ImageOps
import imagehash
from concurrent.futures import ProcessPoolExecutor
REPO=os.path.abspath(os.path.join(os.path.dirname(__file__),'..','..'))
d=json.load(open(f'{REPO}/data/local-properties.json'))

def stats(path):
    fp=REPO+'/public'+path
    raw=open(fp,'rb').read()
    sha=hashlib.sha256(raw).hexdigest()
    im=Image.open(fp); im=ImageOps.exif_transpose(im).convert('RGB')
    w,h=im.size
    ph=str(imagehash.phash(im)); dh=str(imagehash.dhash(im))
    sm=im.copy(); sm.thumbnail((256,256))
    a=np.asarray(sm).astype(np.float32)/255
    hsv=np.asarray(sm.convert('HSV')).astype(np.float32)/255
    L=0.2126*a[...,0]+0.7152*a[...,1]+0.0722*a[...,2]
    s=hsv[...,1]; v=hsv[...,2]; hue=hsv[...,0]*360
    top=slice(0,a.shape[0]//3)
    sky=((hue[top]>180)&(hue[top]<250)&(s[top]>0.12)&(v[top]>0.45)).mean()
    green=((hue>60)&(hue<170)&(s>0.18)&(v>0.15)).mean()
    white=(L>0.85).mean(); mid=((L>0.25)&(L<0.75)).mean()
    return dict(path=path, sha=sha, phash=ph, dhash=dh, w=w, h=h, bytes=len(raw),
        L_mean=float(L.mean()), L_med=float(np.median(L)), L_p01=float(np.percentile(L,0.5)), L_p99=float(np.percentile(L,99.5)),
        sat=float(s.mean()), sky=float(sky), green=float(green), white=float(white), mid=float(mid))

def work(p):
    slug=p['slug']['current']
    ims=[x for x in (p.get('images') or []) if isinstance(x,str) and x.startswith('/uploads/')]
    out=[]
    for x in ims:
        try: out.append(stats(x))
        except Exception as e: out.append(dict(path=x, error=str(e)))
    return slug, out

if __name__=='__main__':
    with ProcessPoolExecutor(8) as ex:
        res=dict(ex.map(work, d))
    json.dump(res, open(os.environ.get('PHOTO_STATS','/tmp/photo-stats.json'),'w'))
    print(sum(len(v) for v in res.values()), sum(1 for v in res.values() for x in v if 'error' in x))
