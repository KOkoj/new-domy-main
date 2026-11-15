import { ATTRIBUTION_COLUMN_NAMES } from './attribution.js'

export function isMissingColumnError(err, names) {
  return (
    err?.code === '42703' ||
    err?.code === 'PGRST204' ||
    new RegExp(`(${names.join('|')})`, 'i').test(err?.message || '')
  )
}

// Insert an inquiry, but never lose the lead if attribution (or later
// metadata) columns have not been migrated yet.
export async function insertInquiryWithFallback(supabase, insertPayload) {
  const payload = { ...insertPayload }
  let { data, error } = await supabase.from('inquiries').insert([payload]).select().single()

  if (
    error &&
    ATTRIBUTION_COLUMN_NAMES.some((column) => column in payload) &&
    isMissingColumnError(error, ATTRIBUTION_COLUMN_NAMES)
  ) {
    console.warn(
      '[INQUIRIES] attribution columns missing (run db/add-inquiry-attribution-columns.sql). Retrying without them:',
      error.message
    )
    ATTRIBUTION_COLUMN_NAMES.forEach((column) => delete payload[column])
    const retry = await supabase.from('inquiries').insert([payload]).select().single()
    data = retry.data
    error = retry.error
  }

  if (error) {
    const isMissingMetadataColumn =
      error.code === '42703' ||
      error.code === 'PGRST204' ||
      /column .*(inquiryType|propertyTitle).* does not exist/i.test(error.message || '')

    if (isMissingMetadataColumn) {
      console.warn(
        '[INQUIRIES] inquiryType/propertyTitle columns missing (run db/add-inquiry-metadata-columns.sql). Retrying insert without them:',
        error.message
      )
      const fallbackPayload = { ...payload }
      delete fallbackPayload.inquiryType
      delete fallbackPayload.propertyTitle
      const retry = await supabase.from('inquiries').insert([fallbackPayload]).select().single()
      data = retry.data
      error = retry.error
    }
  }

  return { data, error }
}
