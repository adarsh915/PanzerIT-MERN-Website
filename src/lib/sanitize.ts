/**
 * Strips any oversized base64 data URIs from any value, recursively.
 * Safe to call on strings, arrays, or objects of any depth.
 *
 * Use this in every server-side data-fetching function that returns
 * content to a frontend page, so base64 images stored in the DB can
 * never bloat page payloads.
 */
export function sanitizeDeep<T>(value: T): T {
  if (value === null || value === undefined) return value

  if (typeof value === 'string') {
    if (value.startsWith('data:image/') && value.length > 50000) {
      console.warn('[sanitize] Stripped oversized base64 data URI from payload')
      return undefined as unknown as T
    }
    return value
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeDeep) as unknown as T
  }

  if (typeof value === 'object') {
    const cleaned: Record<string, unknown> = {}
    for (const key of Object.keys(value as Record<string, unknown>)) {
      cleaned[key] = sanitizeDeep((value as Record<string, unknown>)[key])
    }
    return cleaned as T
  }

  return value
}

/**
 * Guards an image field before writing to the database.
 * If the value is a base64 data URI (any length), returns '' so it is
 * never persisted. A real upload URL is returned unchanged.
 */
export function stripBase64(value: string | undefined | null): string {
  if (!value) return ''
  if (value.startsWith('data:')) {
    console.warn('[sanitize] Blocked base64 image from being saved to DB — re-upload required')
    return ''
  }
  return value
}