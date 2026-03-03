import { createClient } from '@supabase/supabase-js'

const DEFAULT_CATEGORY = {
  en: 'Blog',
  cs: 'Blog',
  it: 'Blog'
}

const FALLBACK_ARTICLES = [
  {
    slug: 'real-estate-purchase-system-italy',
    title: {
      en: 'How the real estate purchasing system in Italy really works (for those buying from abroad)',
      cs: 'Jak opravdu funguje systém koupě nemovitosti v Itálii (pro kupující ze zahraničí)',
      it: "Come funziona davvero il sistema di acquisto immobiliare in Italia (per chi compra dall'estero)"
    },
    excerpt: {
      en: 'A clear guide to roles, checks, and responsibilities in the Italian system. Key differences from the Czech process and the risks to avoid.',
      cs: 'Jasný průvodce rolemi, kontrolami a odpovědnostmi v italském systému. Hlavní rozdíly oproti českému procesu a rizika, kterým se vyhnout.',
      it: 'Una guida chiara su ruoli, controlli e responsabilità nel sistema italiano. Differenze rispetto al processo ceco e rischi da evitare.'
    },
    body: {
      en:
        'Buying in Italy is not only about price negotiation. It is a sequence of legal, technical, and financial checks where each actor has a specific role.\n\nWho does what:\n- The real estate agent intermediates between buyer and seller.\n- The notary guarantees formal legality of the deed and registration.\n- Technical checks often require a surveyor or specialist.\n\nMain risk for foreign buyers:\nAssuming that one professional automatically covers the entire process. In practice, responsibilities are distributed, and missing one verification can create costly consequences later.\n\nBefore signing any binding document, verify urban and cadastral compliance, ownership continuity, and tax implications for your specific case.',
      cs:
        'Nákup v Itálii není jen o vyjednání ceny. Je to sled právních, technických a finančních kontrol, kde má každý účastník přesně vymezenou roli.\n\nKdo za co odpovídá:\n- Realitní makléř zprostředkovává mezi kupujícím a prodávajícím.\n- Notář zajišťuje formální zákonnost smlouvy a zápis.\n- Technické kontroly často vyžadují geometra nebo specialistu.\n\nHlavní riziko pro zahraniční kupující:\nPředpoklad, že jeden odborník automaticky pokryje celý proces. Ve skutečnosti jsou odpovědnosti rozdělené a vynechání jedné kontroly může později znamenat vysoké náklady.\n\nPřed podpisem jakéhokoli závazného dokumentu ověřte urbanistický a katastrální soulad, návaznost vlastnictví a daňové dopady pro váš konkrétní případ.',
      it:
        'Comprare in Italia non significa solo negoziare il prezzo. È una sequenza di verifiche legali, tecniche e fiscali in cui ogni professionista ha un ruolo specifico.\n\nChi fa cosa:\n- L’agente immobiliare media tra acquirente e venditore.\n- Il notaio garantisce la legalità formale dell’atto e la registrazione.\n- Le verifiche tecniche richiedono spesso un geometra o uno specialista.\n\nRischio principale per chi compra dall’estero:\nPensare che un solo professionista copra automaticamente tutto il processo. In pratica le responsabilità sono distribuite e saltare una verifica può generare costi rilevanti in seguito.\n\nPrima di firmare documenti vincolanti, verifica conformità urbanistica e catastale, continuità della proprietà e impatto fiscale sul tuo caso specifico.'
    },
    category: DEFAULT_CATEGORY,
    author: 'Domy v Itálii',
    readTime: '6-8 min',
    publishedAt: '2026-02-11'
  }
]

function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) return null

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  })
}

function isObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function safeParseJson(value) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) return null

  try {
    return JSON.parse(trimmed)
  } catch {
    return null
  }
}

function buildLocalizedValue(value, fallback = '') {
  const base = value || fallback || ''
  return {
    en: base,
    cs: base,
    it: base
  }
}

function resolveLocalizedField(record, baseName, fallback = '') {
  const direct = record?.[baseName]

  if (isObject(direct) && (direct.en || direct.cs || direct.it)) {
    return {
      en: direct.en || fallback || '',
      cs: direct.cs || direct.en || fallback || '',
      it: direct.it || direct.en || fallback || ''
    }
  }

  const directJson = safeParseJson(direct)
  if (isObject(directJson) && (directJson.en || directJson.cs || directJson.it)) {
    return {
      en: directJson.en || fallback || '',
      cs: directJson.cs || directJson.en || fallback || '',
      it: directJson.it || directJson.en || fallback || ''
    }
  }

  const fromSuffix = {
    en: record?.[`${baseName}_en`] || '',
    cs: record?.[`${baseName}_cs`] || '',
    it: record?.[`${baseName}_it`] || ''
  }

  if (fromSuffix.en || fromSuffix.cs || fromSuffix.it) {
    return {
      en: fromSuffix.en || fallback || '',
      cs: fromSuffix.cs || fromSuffix.en || fallback || '',
      it: fromSuffix.it || fromSuffix.en || fallback || ''
    }
  }

  const fromTranslations = record?.translations?.[baseName]
  if (isObject(fromTranslations) && (fromTranslations.en || fromTranslations.cs || fromTranslations.it)) {
    return {
      en: fromTranslations.en || fallback || '',
      cs: fromTranslations.cs || fromTranslations.en || fallback || '',
      it: fromTranslations.it || fromTranslations.en || fallback || ''
    }
  }

  return buildLocalizedValue(typeof direct === 'string' ? direct : '', fallback)
}

function normalizeSlug(slug) {
  if (typeof slug !== 'string') return ''
  return slug
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, '')
    .replace(/^guides\//, '')
}

function extractSlug(record) {
  if (typeof record?.slug === 'string') {
    return normalizeSlug(record.slug)
  }

  if (isObject(record?.slug) && typeof record.slug.current === 'string') {
    return normalizeSlug(record.slug.current)
  }

  const pathCandidates = [record?.path, record?.url, record?.link, record?.content_url]
  for (const candidate of pathCandidates) {
    if (typeof candidate !== 'string') continue
    if (!candidate.includes('/guides/')) continue

    try {
      const parsed = candidate.startsWith('http')
        ? new URL(candidate)
        : new URL(candidate, 'https://example.local')
      const parts = parsed.pathname.split('/').filter(Boolean)
      const guidesIndex = parts.indexOf('guides')
      if (guidesIndex >= 0 && parts[guidesIndex + 1]) {
        return normalizeSlug(parts[guidesIndex + 1])
      }
    } catch {
      continue
    }
  }

  return ''
}

function isLikelyUrl(value) {
  if (typeof value !== 'string') return false
  const trimmed = value.trim()
  return trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/')
}

function toIsoDate(value, fallbackDate) {
  if (!value) return fallbackDate
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return fallbackDate
  return date.toISOString().slice(0, 10)
}

function isPublicRecord(record) {
  const status = typeof record?.status === 'string' ? record.status.toLowerCase() : ''
  if (status && ['draft', 'private', 'archived', 'hidden'].includes(status)) {
    return false
  }

  if (record?.is_public === false) return false
  if (record?.is_published === false) return false
  if (record?.published === false) return false

  if (record?.published_at) {
    const publishedAt = new Date(record.published_at)
    if (!Number.isNaN(publishedAt.getTime()) && publishedAt.getTime() > Date.now()) {
      return false
    }
  }

  return true
}

function normalizeArticleRecord(record) {
  const slug = extractSlug(record)
  if (!slug) return null
  if (!isPublicRecord(record)) return null

  const parsedContentUrl = safeParseJson(record?.content_url)
  const bodyFromJson = isObject(parsedContentUrl) ? parsedContentUrl.body : null
  const bodyFromRaw = !isLikelyUrl(record?.content_url) ? record?.content_url : ''
  const bodySource =
    bodyFromJson ||
    record?.body ||
    record?.article_body ||
    record?.article_content ||
    record?.content ||
    record?.content_text ||
    record?.full_text ||
    record?.text ||
    bodyFromRaw ||
    record?.description ||
    ''

  const title = resolveLocalizedField(record, 'title', '')
  const excerpt = resolveLocalizedField(record, 'description', '')
  const body = isObject(bodySource)
    ? {
        en: bodySource.en || excerpt.en || '',
        cs: bodySource.cs || bodySource.en || excerpt.cs || '',
        it: bodySource.it || bodySource.en || excerpt.it || ''
      }
    : buildLocalizedValue(typeof bodySource === 'string' ? bodySource : '', '')

  const category = resolveLocalizedField(record, 'category', DEFAULT_CATEGORY.en)

  return {
    id: record?.id || slug,
    slug,
    title,
    excerpt,
    body,
    category,
    author: record?.author || 'Domy v Itálii',
    readTime: record?.read_time || '6 min',
    publishedAt: toIsoDate(record?.published_at, '2026-02-11'),
    source: 'supabase'
  }
}

async function fetchSupabaseArticles() {
  const client = getSupabaseServerClient()
  if (!client) return []

  try {
    const { data, error } = await client
      .from('premium_content')
      .select('*')
      .eq('content_type', 'article')
      .order('published_at', { ascending: false })
      .limit(200)

    if (error || !Array.isArray(data)) {
      return []
    }

    return data
      .map(normalizeArticleRecord)
      .filter(Boolean)
  } catch {
    return []
  }
}

function cloneFallback() {
  return FALLBACK_ARTICLES.map((item) => ({ ...item, source: 'fallback' }))
}

export async function getPublicArticles() {
  const fallback = cloneFallback()
  const fromSupabase = await fetchSupabaseArticles()

  if (!fromSupabase.length) {
    return fallback
  }

  const merged = new Map()
  for (const item of fallback) merged.set(item.slug, item)
  for (const item of fromSupabase) merged.set(item.slug, item)

  return [...merged.values()].sort((a, b) => {
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  })
}

export async function getPublicArticleBySlug(slug) {
  const normalizedSlug = normalizeSlug(slug)
  if (!normalizedSlug) return null

  const articles = await getPublicArticles()
  return articles.find((item) => item.slug === normalizedSlug) || null
}
