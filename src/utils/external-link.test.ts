import { describe, expect, it, vi } from 'vitest'

describe('external link navigation', () => {
  it('uses browser navigation for an API-filtered HTTPS URL', async () => {
    const assign = vi.fn()
    vi.stubGlobal('window', { location: { assign } })
    const { openExternalLink } = await import('./external-link')
    openExternalLink('https://example.com/guide')
    expect(assign).toHaveBeenCalledWith('https://example.com/guide')
    vi.unstubAllGlobals()
  })
})
