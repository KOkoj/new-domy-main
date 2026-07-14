// Canonical name handling for `profiles`. Columns are `first_name`/`last_name`;
// the legacy `name` column is display-only debt that is no longer written to.

export function splitFullName(fullName) {
  const trimmed = String(fullName || '').trim()
  if (!trimmed) return { firstName: '', lastName: '' }

  const spaceIndex = trimmed.indexOf(' ')
  if (spaceIndex === -1) {
    return { firstName: trimmed, lastName: '' }
  }

  return {
    firstName: trimmed.slice(0, spaceIndex).trim(),
    lastName: trimmed.slice(spaceIndex + 1).trim()
  }
}

// profile: { first_name, last_name } (any other shape is ignored).
// fallback: typically the auth user's email.
export function getProfileDisplayName(profile, fallback = null) {
  const firstName = String(profile?.first_name || '').trim()
  const lastName = String(profile?.last_name || '').trim()
  const combined = [firstName, lastName].filter(Boolean).join(' ').trim()
  return combined || fallback || null
}
