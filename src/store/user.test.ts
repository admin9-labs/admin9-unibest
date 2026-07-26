import { getMember } from '@/api/member'
import { describe, expect, it, vi } from 'vitest'
import { clearSession, establishSession, getSessionIdentity, rotateSession } from '@/http/session'
import { useUserStore } from './user'

vi.mock('@/api/member', () => ({ getMember: vi.fn() }))

const member = {
  id: 42,
  name: 'Member',
  email: 'member@example.test',
  mobile: null,
  is_active: true,
  last_login_at: null,
}

const newerMember = { ...member, id: 84, name: 'New account' }

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise
  })
  return { promise, resolve }
}

describe('useUserStore', () => {
  it('starts without a member and stores only the read-only resource', () => {
    const store = useUserStore()
    expect(store.member).toBeNull()
    store.setMember(member)
    expect(store.member).toEqual(member)
    expect(Object.keys(store.member!)).toEqual(['id', 'name', 'email', 'mobile', 'is_active', 'last_login_at'])
  })

  it('fetches and clears the member', async () => {
    establishSession('member-token', 3600)
    vi.mocked(getMember).mockResolvedValue(member)
    const store = useUserStore()
    await store.fetchMember()
    expect(store.member).toEqual(member)
    store.clearMember()
    expect(store.member).toBeNull()
  })

  it('discards a member response that arrives after logout', async () => {
    establishSession('account-a', 3600)
    const request = deferred<typeof member>()
    vi.mocked(getMember).mockReturnValueOnce(request.promise)
    const store = useUserStore()

    const fetch = store.fetchMember()
    clearSession()
    request.resolve(member)

    await expect(fetch).resolves.toBeUndefined()
    expect(store.member).toBeNull()
  })

  it('does not overwrite a newer account with a late member response', async () => {
    establishSession('account-a', 3600)
    const request = deferred<typeof member>()
    vi.mocked(getMember).mockReturnValueOnce(request.promise)
    const store = useUserStore()

    const fetch = store.fetchMember()
    establishSession('account-b', 3600)
    store.setMember(newerMember)
    request.resolve(member)

    await expect(fetch).resolves.toBeUndefined()
    expect(store.member).toEqual(newerMember)
  })

  it('accepts a member response across token rotation in the same identity', async () => {
    establishSession('old-token', 3600)
    const request = deferred<typeof member>()
    vi.mocked(getMember).mockReturnValueOnce(request.promise)
    const store = useUserStore()

    const fetch = store.fetchMember()
    rotateSession(getSessionIdentity()!, 'new-token', 3600)
    request.resolve(member)

    await expect(fetch).resolves.toEqual(member)
    expect(store.member).toEqual(member)
  })
})
