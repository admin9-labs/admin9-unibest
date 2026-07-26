export interface StoredSession {
  accessToken: string
  expiresAt: number
}

export interface SessionIdentity {
  generation: number
  accessToken: string
}

const SESSION_KEY = 'member-session'

let session: StoredSession | null = null
let generation = 0
let sessionListener: ((value: StoredSession | null) => void) | undefined

function persistSession(value: StoredSession | null) {
  session = value
  if (value)
    uni.setStorageSync(SESSION_KEY, value)
  else
    uni.removeStorageSync(SESSION_KEY)
  sessionListener?.(value)
}

export function hydrateSession() {
  const stored = uni.getStorageSync(SESSION_KEY) as StoredSession | null
  generation++
  session = stored?.accessToken ? { accessToken: stored.accessToken, expiresAt: stored.expiresAt } : null
  return session
}

export function getSession() {
  return session
}

export function getSessionIdentity(): SessionIdentity | null {
  return session ? { generation, accessToken: session.accessToken } : null
}

export function getSessionGeneration() {
  return generation
}

export function isSessionGenerationCurrent(expectedGeneration: number) {
  return generation === expectedGeneration
}

export function isSessionIdentityCurrent(identity: SessionIdentity) {
  return generation === identity.generation && session?.accessToken === identity.accessToken
}

export function beginSessionTransition() {
  generation++
  persistSession(null)
  return generation
}

export function establishSession(accessToken: string, expiresIn: number, expectedGeneration?: number) {
  if (expectedGeneration !== undefined && generation !== expectedGeneration)
    return null

  generation++
  const now = Date.now()
  const nextSession = {
    accessToken,
    expiresAt: now + expiresIn * 1000,
  }
  persistSession(nextSession)
  return { session: nextSession, identity: getSessionIdentity()! }
}

export function clearSession() {
  beginSessionTransition()
}

export function clearSessionIfGenerationCurrent(expectedGeneration: number) {
  if (!isSessionGenerationCurrent(expectedGeneration))
    return false
  clearSession()
  return true
}

export function clearSessionIfIdentityCurrent(identity: SessionIdentity) {
  if (!isSessionIdentityCurrent(identity))
    return false
  clearSession()
  return true
}

export function rotateSession(identity: SessionIdentity, accessToken: string, expiresIn: number) {
  if (!isSessionIdentityCurrent(identity))
    return null

  const nextSession = {
    accessToken,
    expiresAt: Date.now() + expiresIn * 1000,
  }
  persistSession(nextSession)
  return { generation, accessToken }
}

export function onSessionChanged(listener: (value: StoredSession | null) => void) {
  sessionListener = listener
}
