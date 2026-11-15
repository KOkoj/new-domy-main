#!/usr/bin/env python3
"""Mild global fixes (levels, exposure, capped grey-world white balance, light
unsharp mask) for listing JPEGs, in place. Original quantisation tables and
chroma subsampling are kept, so file size stays about the same. Floor plans,
PNG/WebP and photos that need no correction are left byte-identical.
Originals stay in git history (revert: git checkout <base> -- <path>).

  python3 scripts/photo-curation/run_enhance.py [--dry-run]
"""
import json, os, sys, re
from concurrent.futures import ProcessPoolExecutor
sys.path.insert(0, os.path.dirname(__file__))
from enhance import process
REPO=os.path.abspath(os.path.join(os.path.dirname(__file__),'..','..'))
MAN=os.path.join(os.path.dirname(__file__),'enhanced-manifest.json')
PLAN_RE=re.compile(r'(^|[-_])(plan|planimetria|pianta|floorplan)', re.I)
def job(path): return process(REPO+'/public'+path, write='--dry-run' not in sys.argv)
if __name__=='__main__':
    D=json.load(open(f'{REPO}/data/local-properties.json'))
    side=json.load(open(f'{REPO}/data/photo-curation.json'))['listings']
    try: done={e['path'] for e in json.load(open(MAN))['files']}
    except Exception: done=set()
    paths=[]
    for p in D:
        extra=set(side.get(p['slug']['current'],{}).get('plans',[]))
        for x in p.get('images') or []:
            if not (isinstance(x,str) and x.startswith('/uploads/')): continue
            name=re.sub(r'^(\d+-)+','',x.rsplit('/',1)[-1].rsplit('.',1)[0])
            if PLAN_RE.search(name) or x in extra or x in done: continue
            paths.append(x)
    with ProcessPoolExecutor(8) as ex: res=list(ex.map(job, paths))
    files=[dict(path=r['path'].replace(REPO+'/public',''), ops=r['ops'], before=r['before'], after=r['after']) for r in res if r.get('ops')]
    if '--dry-run' not in sys.argv:
        try: old=json.load(open(MAN))['files']
        except Exception: old=[]
        json.dump({'files':old+files},open(MAN,'w'),indent=0)
    print(json.dumps(dict(considered=len(paths), enhanced=len(files), skipped=sum(1 for r in res if 'skipped' in r),
        unchanged=sum(1 for r in res if r.get('ops')=={}), bytes_before=sum(f['before'] for f in files), bytes_after=sum(f['after'] for f in files))))
