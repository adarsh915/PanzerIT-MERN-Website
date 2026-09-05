/**
 * Edge-compatible session token signing/verification using Web Crypto API.
 * No Node.js native modules — safe to use in Next.js Middleware.
 *
 * Token format stored in cookie: `rawToken|role.hmacSignature`
 *  - rawToken: 64-char random hex (stored in DB)
 *  - role: The user's role (admin, manager, author)
 *  - hmacSignature: HMAC-SHA256("rawToken|role", SECRET) encoded as hex
 *
 * This means:
 *  - Forged cookies fail HMAC check → rejected without any DB call
 *  - Middleware is fast and Edge-compatible, and can access the role directly
 *  - Logout still deletes the rawToken from the DB
 */

const SECRET = process.env.PANZER_SESSION_SECRET

function getActiveSecret() {
  if (process.env.NODE_ENV === 'production' && !SECRET) {
    throw new Error('FATAL: PANZER_SESSION_SECRET must be set in production. Refusing to start for security reasons.')
  }
  return SECRET || 'panzer-dev-secret-CHANGE-IN-PRODUCTION'
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16)
  }
  return bytes
}

function bytesToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function getHmacKey(): Promise<CryptoKey> {
  const enc = new TextEncoder()
  return crypto.subtle.importKey(
    'raw',
    enc.encode(getActiveSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
}

/**
 * Signs a rawToken and role, returning the full cookie value: `rawToken|role.hmacSignature`
 */
export async function signToken(rawToken: string, role: string = 'admin'): Promise<string> {
  const key = await getHmacKey()
  const enc = new TextEncoder()
  const payload = `${rawToken}|${role}`
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload))
  return `${payload}.${bytesToHex(sig)}`
}

/**
 * Verifies a cookie value (`rawToken|role.hmacSignature`).
 * Returns an object { rawToken, role } if valid, or null if forged/malformed.
 */
export async function verifyToken(cookieValue: string): Promise<{ rawToken: string, role: string } | null> {
  try {
    const dotIndex = cookieValue.lastIndexOf('.')
    if (dotIndex === -1) return null

    const payload = cookieValue.substring(0, dotIndex)
    const sigHex = cookieValue.substring(dotIndex + 1)

    if (!payload || !sigHex) return null

    const pipeIndex = payload.indexOf('|')
    if (pipeIndex === -1) return null

    const rawToken = payload.substring(0, pipeIndex)
    const role = payload.substring(pipeIndex + 1)

    const key = await getHmacKey()
    const enc = new TextEncoder()
    const sigBytes = hexToBytes(sigHex)

    const valid = await crypto.subtle.verify('HMAC', key, sigBytes as any, enc.encode(payload))
    return valid ? { rawToken, role } : null
  } catch {
    return null
  }
}
