const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

function loadEnvFromFile(filePath) {
  const out = {}
  if (!fs.existsSync(filePath)) return out
  const raw = fs.readFileSync(filePath, 'utf8')
  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#')) continue
    const idx = line.indexOf('=')
    if (idx <= 0) continue
    const key = line.slice(0, idx).trim()
    const value = line.slice(idx + 1).trim()
    out[key] = value
  }
  return out
}

async function main() {
  const root = process.cwd()
  const env = {
    ...loadEnvFromFile(path.join(root, '.env.local')),
    ...process.env
  }

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY
  const bucket = env.PREMIUM_PDF_BUCKET || 'documents'

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
  }
  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })

  const uploads = [
    {
      source: path.join(root, 'public', 'pdfs', 'PDF Premium Domy 1.pdf (1).pdf'),
      target: env.PREMIUM_PDF_PATH_DOMY || 'premium/premium-domy.pdf'
    },
    {
      source: path.join(root, 'public', 'pdfs', 'Premium NOTÁŘ.pdf'),
      target: env.PREMIUM_PDF_PATH_NOTARY || 'premium/premium-notary.pdf'
    }
  ]

  for (const item of uploads) {
    if (!fs.existsSync(item.source)) {
      throw new Error(`Missing source file: ${item.source}`)
    }

    const fileBuffer = fs.readFileSync(item.source)
    const { error } = await supabase.storage
      .from(bucket)
      .upload(item.target, fileBuffer, {
        upsert: true,
        contentType: 'application/pdf'
      })

    if (error) {
      throw new Error(`Upload failed for ${item.target}: ${error.message}`)
    }

    const { data: signedData, error: signedError } = await supabase.storage
      .from(bucket)
      .createSignedUrl(item.target, 60)

    if (signedError) {
      throw new Error(`Signed URL test failed for ${item.target}: ${signedError.message}`)
    }

    if (!signedData?.signedUrl) {
      throw new Error(`Signed URL missing for ${item.target}`)
    }

    console.log(`Uploaded and verified: ${bucket}/${item.target}`)
  }

  console.log('Premium PDF upload completed.')
}

main().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
