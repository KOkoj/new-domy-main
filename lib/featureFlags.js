export const PREMIUM_PDFS_ENABLED = process.env.NEXT_PUBLIC_PREMIUM_PDFS_ENABLED === 'true'
export const ADMIN_LAUNCH_TOOLS_ENABLED = process.env.ADMIN_LAUNCH_TOOLS_ENABLED === 'true'
export const PUBLIC_SITE_STANDBY = false

export function getPremiumPdfDisabledResponse() {
  return {
    error: 'PREMIUM_PDFS_DISABLED',
    message: 'Premium PDFs are not available yet.'
  }
}

export function getAdminToolDisabledResponse() {
  return {
    error: 'ADMIN_TOOL_DISABLED',
    message: 'This admin tool is not enabled for the current launch.'
  }
}

// Soft lock of the rest of the gallery, video and exact map point on
// `exclusive` listings for visitors who have not given an e-mail yet.
// Default OFF: unset, '0' or 'false' keeps every listing fully public and
// renders no new badge, lock or copy.
export function isExclusiveGalleryLockOn(value = process.env.NEXT_PUBLIC_EXCLUSIVE_GALLERY_LOCK) {
  const normalized = String(value ?? '').trim().toLowerCase()
  return normalized === '1' || normalized === 'true'
}

export const EXCLUSIVE_GALLERY_LOCK_ENABLED = isExclusiveGalleryLockOn()
