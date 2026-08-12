import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getConsultationCredential, saveConsultationCredential } from './consultation-credential'

describe('guest consultation credential storage', () => {
  const storage = new Map<string, unknown>()
  beforeEach(() => {
    storage.clear()
    vi.mocked(uni.getStorageSync).mockImplementation(key => storage.get(key))
    vi.mocked(uni.setStorageSync).mockImplementation((key, value) => storage.set(key, value))
  })

  it('stores the credential locally by ticket and rejects expired values', () => {
    saveConsultationCredential({ ticketNo: 'ZX-1', credential: 'secret-one', expiresAt: new Date(Date.now() + 60000).toISOString() })
    expect(getConsultationCredential('ZX-1')).toBe('secret-one')

    saveConsultationCredential({ ticketNo: 'ZX-2', credential: 'expired', expiresAt: new Date(Date.now() - 60000).toISOString() })
    expect(getConsultationCredential('ZX-2')).toBeNull()
  })
})
