import type { Member } from '@/api/member'
import { describe, expect, it, vi } from 'vitest'
import { getSession, getSessionIdentity, rotateSession } from '@/http/session'
import { useUserStore } from './user'
import { useTokenStore } from './token'

const { changePassword, login, logout } = vi.hoisted(() => ({
  changePassword: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
}))

vi.mock('@/api/member', () => ({ changePassword, login, logout }))

const memberA: Member = { id: 1, name: 'Account A', email: null, mobile: null, is_active: true, last_login_at: null }
const memberB: Member = { id: 2, name: 'Account B', email: null, mobile: null, is_active: true, last_login_at: null }

function loginResult(accessToken: string, member: Member) {
  return { access_token: accessToken, token_type: 'bearer', expires_in: 3600, member }
}

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })
  return { promise, reject, resolve }
}

describe('useTokenStore session coherence', () => {
  it('hydrates stored auth and follows same-identity HTTP token rotation', () => {
    vi.mocked(uni.getStorageSync).mockImplementation(key => key === 'member-session'
      ? { accessToken: 'stored-jwt', expiresAt: 1 }
      : null)
    const store = useTokenStore()

    expect(store.hasLogin).toBe(true)
    expect(store.session?.accessToken).toBe('stored-jwt')

    rotateSession(getSessionIdentity()!, 'refreshed-jwt', 3600)
    expect(store.session?.accessToken).toBe('refreshed-jwt')
    expect(store.hasLogin).toBe(true)
  })

  it('lets only the latest concurrent login establish identity', async () => {
    const accountA = deferred<ReturnType<typeof loginResult>>()
    const accountB = deferred<ReturnType<typeof loginResult>>()
    login.mockImplementation(({ account }: { account: string }) => account === 'a' ? accountA.promise : accountB.promise)
    const store = useTokenStore()

    const first = store.login({ account: 'a', password: 'password-a' })
    const second = store.login({ account: 'b', password: 'password-b' })
    accountB.resolve(loginResult('token-b', memberB))
    await expect(second).resolves.toMatchObject({ access_token: 'token-b' })
    accountA.resolve(loginResult('token-a', memberA))
    await expect(first).rejects.toThrow('newer session transition')

    expect(getSession()?.accessToken).toBe('token-b')
    expect(useUserStore().member).toEqual(memberB)
  })

  it('does not let a late logout clear or report success for a newer login', async () => {
    const pendingLogout = deferred<void>()
    login.mockResolvedValueOnce(loginResult('token-a', memberA))
    logout.mockReturnValueOnce(pendingLogout.promise)
    const store = useTokenStore()
    await store.login({ account: 'a', password: 'password-a' })

    const oldLogout = store.logout()
    login.mockResolvedValueOnce(loginResult('token-b', memberB))
    await store.login({ account: 'b', password: 'password-b' })
    pendingLogout.resolve()

    await expect(oldLogout).resolves.toBe(false)
    expect(getSession()?.accessToken).toBe('token-b')
    expect(useUserStore().member).toEqual(memberB)
    expect(logout).toHaveBeenCalledWith('token-a')
  })

  it('does not let a late password success clear a newer login', async () => {
    const pendingPassword = deferred<void>()
    login.mockResolvedValueOnce(loginResult('token-a', memberA))
    changePassword.mockReturnValueOnce(pendingPassword.promise)
    const store = useTokenStore()
    await store.login({ account: 'a', password: 'password-a' })

    const oldPassword = store.changePassword({
      current_password: 'password-a',
      password: 'replacement-a',
      password_confirmation: 'replacement-a',
    })
    login.mockResolvedValueOnce(loginResult('token-b', memberB))
    await store.login({ account: 'b', password: 'password-b' })
    pendingPassword.resolve()

    await expect(oldPassword).resolves.toBe(false)
    expect(getSession()?.accessToken).toBe('token-b')
    expect(useUserStore().member).toEqual(memberB)
  })
})
