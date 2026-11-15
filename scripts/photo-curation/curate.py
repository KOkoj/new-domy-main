#!/usr/bin/env python3
"""Free photo curation (no paid API, no generative model).

  pip install pillow numpy imagehash
  PHOTO_STATS=/tmp/photo-stats.json python3 scripts/photo-curation/analyze.py
  PHOTO_STATS=/tmp/photo-stats.json python3 scripts/photo-curation/curate.py [--write-data]

Writes data/photo-curation.json (duplicates to hide, floor plans, cover
overrides). The ordering rules mirror lib/photoCuration.js. With
--write-data it also rewrites data/local-properties.json image arrays into the
curated order (no files are deleted).
"""
import json, re, os, sys, imagehash
REPO=os.path.abspath(os.path.join(os.path.dirname(__file__),'..','..'))
S=json.load(open(os.environ.get('PHOTO_STATS','/tmp/photo-stats.json')))
DATA=f'{REPO}/data/local-properties.json'
D=json.load(open(DATA))
H=lambda a,b: imagehash.hex_to_hash(a)-imagehash.hex_to_hash(b)
PLAN_RE=re.compile(r'(^|[-_])(plan|planimetria|pianta|floorplan)', re.I)
# Cover overrides: from the paid-for pilot scoring already done on 15.11.2026
# (proposal.json, sell delta >= 2). No new model run. Free heuristics
# (sky/green ratio, brightness) were tried but produced false positives, so
# they are not applied automatically.
COVER_OVERRIDES={
  'toscana-rustico-quiesa-massarosa-132061064':'/uploads/properties/toscana-rustico-quiesa-massarosa-132061064/02.jpg',
  'toscana-terratetto-solaio-pietrasanta-127378181':'/uploads/properties/toscana-terratetto-solaio-pietrasanta-127378181/03.jpg',
}
def base(p): return p.split('?')[0].rsplit('/',1)[-1].rsplit('.',1)[0]
def gkey(p):
    if not p.startswith('/uploads/'): return None
    n=base(p); leg=n.startswith('legacy-'); n=re.sub(r'^legacy-','',n)
    m=re.fullmatch(r'gallery-(\d+)',re.sub(r'^(\d+-)+','',n))
    return (leg,int(m.group(1))) if m else None
def is_plan(p, plans=()):
    return p in plans or (p.startswith('/uploads/') and bool(PLAN_RE.search(re.sub(r'^(\d+-)+','',base(p)))))
def natural_order(images, plans=()):
    out=list(images)
    for leg in (False,True):
        slots=[i for i,p in enumerate(out) if gkey(p) and gkey(p)[0]==leg]
        if len(slots)<2: continue
        items=sorted([(gkey(out[i])[1],n,out[i]) for n,i in enumerate(slots)])
        for i,(_,_,p) in zip(slots,items): out[i]=p
    return [p for p in out if not is_plan(p,plans)]+[p for p in out if is_plan(p,plans)]
def looks_like_plan(st):
    return st['white']>0.6 and st['sat']<0.06 and st['mid']<0.2
def curate(p):
    slug=p['slug']['current']
    ims=[x for x in p.get('images') or [] if isinstance(x,str)]
    st={x['path']:x for x in S.get(slug,[]) if 'sha' in x}
    extra_plans=[x for x in ims if x in st and not is_plan(x) and looks_like_plan(st[x])]
    order=natural_order(ims, extra_plans)
    hide=[]; kept=[]
    for x in order:
        dup=None
        if x in st:
            for k in kept:
                if k in st and (st[k]['sha']==st[x]['sha'] or (H(st[k]['phash'],st[x]['phash'])<=6 and H(st[k]['dhash'],st[x]['dhash'])<=8)):
                    dup=k; break
        (hide if dup else kept).append(x)
    mi=p.get('mainImage') or 0
    explicit=ims[mi] if 0<mi<len(ims) else None
    if explicit in hide: hide.remove(explicit); kept.append(explicit)
    cover=explicit or (COVER_OVERRIDES.get(slug) if COVER_OVERRIDES.get(slug) in kept else None) or (kept[0] if kept else None)
    final=[cover]+[x for x in kept if x!=cover] if cover else []
    return dict(slug=slug, before=ims, after=final, hide=hide, plans=[x for x in kept if is_plan(x,extra_plans)],
                extra_plans=extra_plans, cover=COVER_OVERRIDES.get(slug) if not explicit else None, explicit=explicit)
if __name__=='__main__':
    R=[curate(p) for p in D if p.get('images')]
    # Merge with the existing sidecar: once duplicates are removed from the data
    # file a re-run no longer sees them, but Supabase rows may still hold them.
    try: old=json.load(open(f'{REPO}/data/photo-curation.json')).get('listings',{})
    except Exception: old={}
    side={}
    for r in R:
        o=old.get(r['slug'],{})
        r['hide']=sorted(set(r['hide'])|set(o.get('hide',[])), key=lambda x:(r['hide']+o.get('hide',[])).index(x))
        r['extra_plans']=sorted(set(r['extra_plans'])|set(o.get('plans',[])))
        e={}
        if r['hide']: e['hide']=r['hide']
        if r['extra_plans']: e['plans']=r['extra_plans']
        if r['cover']: e['cover']=r['cover']
        if e: side[r['slug']]=e
    json.dump({'version':1,'generated':'scripts/photo-curation/curate.py','listings':side},open(f'{REPO}/data/photo-curation.json','w'),indent=2,ensure_ascii=False)
    json.dump(R,open(os.environ.get('PHOTO_PLAN','/tmp/photo-plan.json'),'w'),indent=1)
    if '--write-data' in sys.argv:
        byslug={r['slug']:r for r in R}
        for p in D:
            r=byslug.get(p['slug']['current'])
            if not r or not r['after']: continue
            p['images']=r['after']+[x for x in p['images'] if not isinstance(x,str)]
            if 'mainImage' in p: p['mainImage']=0
        raw=open(DATA,encoding='utf-8').read()
        open(DATA,'w',encoding='utf-8').write(json.dumps(D,indent=2,ensure_ascii=False)+('\n' if raw.endswith('\n') else ''))
    reord=sum(1 for r in R if [x for x in r['before'] if x in r['after']][1:]!=r['after'][1:] )
    print(json.dumps(dict(listings=len(R), touched=sum(1 for r in R if r['before']!=r['after']), reordered=reord,
        hidden=sum(len(r['hide']) for r in R), listings_with_dups=sum(1 for r in R if r['hide']),
        plans=sum(len(r['plans']) for r in R), plans_moved=sum(1 for r in R for x in r['plans'] if r['before'].index(x)!=len(r['before'])-1 and x in r['before']),
        covers_changed=sum(1 for r in R if r['cover']))))
