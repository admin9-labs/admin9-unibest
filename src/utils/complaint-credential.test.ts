import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getComplaintCredential, saveComplaintCredential } from './complaint-credential'

describe('guest complaint credential storage', () => {
  const storage = new Map<string, unknown>()
  beforeEach(() => {
    storage.clear()
    vi.mocked(uni.getStorageSync).mockImplementation(key => storage.get(key))
    vi.mocked(uni.setStorageSync).mockImplementation((key, value) => storage.set(key, value))
  })

  it('stores an unexpired credential outside the route', () => {
    saveComplaintCredential({ ticketNo: 'TS-1', credential: 'a'.repeat(64), expiresAt: new Date(Date.now() + 60_000).toISOString() })
    expect(getComplaintCredential('TS-1')).toBe('a'.repeat(64))
  })

  it('does not return expired credentials', () => {
    saveComplaintCredential({ ticketNo: 'TS-2', credential: 'b'.repeat(64), expiresAt: new Date(Date.now() - 1).toISOString() })
    expect(getComplaintCredential('TS-2')).toBeNull()
  })
})
