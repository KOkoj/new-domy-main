import photoCurationData from '../data/photo-curation.json'

/**
 * Gallery curation for self-hosted listing photos. Pure ordering and
 * filtering: no file is changed and no text is added.
 *
 * 1. Natural order. Imported files are named `NN-gallery-K.jpg`, where NN came
 *    from an alphabetical sort (gallery-1, gallery-10, gallery-11, gallery-2…).
 *    The slots holding `gallery-K` files are re-sorted by K, so the source
 *    order (1, 2, … 10) is restored. Other files keep their position, because
 *    descriptive names (e.g. `04-cucina-living.jpeg`) were ordered by hand.
 * 2. Floor plans (`plan` in the file name, or listed in the sidecar) move to
 *    the end of the gallery.
 * 3. Duplicates listed in `data/photo-curation.json` (`hide`, found by content
 *    and perceptual hash, see scripts/photo-curation/) are dropped, so the
 *    gallery does not repeat the cover.
 * 4. Cover: an explicit `mainImage` index > 0 (set in admin) always wins;
 *    otherwise the sidecar `cover` if present, otherwise the first photo.
 *
 * Mirrored by scripts/photo-curation/curate.py, which writes the sidecar.
 */

const CURATION = (photoCurationData && photoCurationData.listings) || {}

function entryPath(entry) {
  if (typeof entry === 'string') return entry
  if (entry && typeof entry === 'object') return entry.url || entry.asset?.url || entry.src || ''
  return ''
}

function baseName(entry) {
  const p = entryPath(entry)
  const file = p.split('?')[0].split('/').pop() || ''
  return file.replace(/\.[a-z0-9]+$/i, '')
}

function galleryKey(entry) {
  if (!entryPath(entry).startsWith('/uploads/')) return null
  let name = baseName(entry)
  const legacy = name.startsWith('legacy-')
  if (legacy) name = name.slice('legacy-'.length)
  const rest = name.replace(/^(\d+-)+/, '')
  const match = /^gallery-(\d+)$/.exec(rest)
  return match ? { legacy, k: Number(match[1]) } : null
}

const PLAN_RE = /(^|[-_])(plan|planimetria|pianta|floorplan)/i

export function isFloorPlanEntry(entry, planSet) {
  const p = entryPath(entry)
  if (planSet && planSet.has(p)) return true
  if (!p.startsWith('/uploads/')) return false
  return PLAN_RE.test(baseName(entry).replace(/^(\d+-)+/, ''))
}

export function orderGalleryImages(images = [], planSet = null) {
  const out = Array.isArray(images) ? images.slice() : []
  for (const legacy of [false, true]) {
    const slots = []
    out.forEach((entry, i) => {
      const key = galleryKey(entry)
      if (key && key.legacy === legacy) slots.push(i)
    })
    if (slots.length < 2) continue
    const items = slots
      .map((i, order) => ({ entry: out[i], k: galleryKey(out[i]).k, order }))
      .sort((a, b) => a.k - b.k || a.order - b.order)
    slots.forEach((slot, n) => { out[slot] = items[n].entry })
  }
  const photos = out.filter(entry => !isFloorPlanEntry(entry, planSet))
  const plans = out.filter(entry => isFloorPlanEntry(entry, planSet))
  return [...photos, ...plans]
}

export function getPhotoCuration(slug) {
  return (slug && CURATION[slug]) || null
}

/**
 * Returns the raw entries in display order, cover first.
 */
export function curatePropertyImages(images = [], { slug = null, mainIndex = 0 } = {}) {
  const list = Array.isArray(images) ? images : []
  if (list.length === 0) return []
  const curation = getPhotoCuration(slug)
  const planSet = curation?.plans ? new Set(curation.plans) : null
  const hidden = new Set(curation?.hide || [])
  const explicitCover = mainIndex > 0 && mainIndex < list.length ? list[mainIndex] : null

  const ordered = orderGalleryImages(list, planSet)
    .filter(entry => entry === explicitCover || !hidden.has(entryPath(entry)))

  let cover = explicitCover
  if (!cover && curation?.cover) {
    cover = ordered.find(entry => entryPath(entry) === curation.cover) || null
  }
  if (!cover) cover = ordered[0]
  return [cover, ...ordered.filter(entry => entry !== cover)]
}
