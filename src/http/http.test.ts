import type { CustomRequestOptions } from './types'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { http, StaleSessionError } from './http'
import { clearSession, clearSessionIfGenerationCurrent, establishSession, getSession, getSessionGeneration, getSessionIdentity, hydrateSession, rotateSession } from './session'

function respond(options: UniApp.RequestOptions, statusCode: number, data: unknown) {
  options.success?.({ statusCode, data, header: {}, cookies: [], errMsg: 'request:ok' })
}

function success(data: unknown) {
  return { success: true, code: 0, message: 'ok', data, request_id: 'request-ok' }
}

function unauthorized() {
  return { success: false, code: 401, message: 'Unauthenticated', data: {}, request_id: 'request-401' }
}

describe('member HTTP authentication', () => {
  beforeEach(async () => {
    await new Promise(resolve => setTimeout(resolve, 0))
    clearSession()
    vi.clearAllMocks()
    vi.mocked(uni.getStorageSync).mockReturnValue(null)
  })

  it('persists a single access token session', () => {
    establishSession('jwt', 3600)
    expect(getSession()?.accessToken).toBe('jwt')
    expect(uni.setStorageSync).toHaveBeenCalledWith('member-session', expect.objectContaining({ accessToken: 'jwt' }))
  })

  it('hydrates a stored session without inventing a refresh deadline', () => {
    vi.mocked(uni.getStorageSync).mockReturnValue({ accessToken: 'stored-jwt', expiresAt: 123 })
    expect(hydrateSession()).toEqual({ accessToken: 'stored-jwt', expiresAt: 123 })
    expect(getSession()).toEqual({ accessToken: 'stored-jwt', expiresAt: 123 })
  })

  it('does not refresh a public login 401', async () => {
    vi.mocked(uni.request).mockImplementation((options) => {
      respond(options, 401, unauthorized())
      return {} as UniApp.RequestTask
    })
    await expect(http({ url: '/api/auth/login', method: 'POST', auth: 'public' })).rejects.toMatchObject({
      statusCode: 401,
      requestId: 'request-401',
    })
    expect(uni.request).toHaveBeenCalledTimes(1)
  })

  it('shares one refresh and replays concurrent 401 requests once', async () => {
    establishSession('expired-jwt', 0)
    let refreshCalls = 0
    const resourceAttempts = new Map<string, number>()
    vi.mocked(uni.request).mockImplementation((options) => {
      if (options.url === '/api/auth/refresh') {
        refreshCalls++
        queueMicrotask(() => respond(options, 200, success({ access_token: 'new-jwt', expires_in: 3600 })))
      }
      else {
        const attempts = (resourceAttempts.get(options.url) || 0) + 1
        resourceAttempts.set(options.url, attempts)
        queueMicrotask(() => respond(options, attempts === 1 ? 401 : 200, attempts === 1 ? unauthorized() : success({ value: options.url })))
      }
      return {} as UniApp.RequestTask
    })

    const [first, second] = await Promise.all([
      http<{ value: string }>({ url: '/api/auth/me', method: 'GET' }),
      http<{ value: string }>({ url: '/api/auth/password', method: 'PUT' }),
    ])
    expect(refreshCalls).toBe(1)
    expect(first.data.value).toBe('/api/auth/me')
    expect(second.data.value).toBe('/api/auth/password')
    expect(getSession()?.accessToken).toBe('new-jwt')
  })

  it('replays a deferred late 401 with the rotated token without refreshing twice', async () => {
    establishSession('expired-jwt', 0)
    let refreshCalls = 0
    let lateUnauthorized: (() => void) | undefined
    const attempts = new Map<string, number>()
    vi.mocked(uni.request).mockImplementation((options) => {
      const authorization = (options.header as Record<string, string>)?.Authorization
      if (options.url === '/api/auth/refresh') {
        refreshCalls++
        queueMicrotask(() => respond(options, 200, success({ access_token: 'new-jwt', expires_in: 3600 })))
      }
      else {
        const attempt = (attempts.get(options.url) || 0) + 1
        attempts.set(options.url, attempt)
        if (attempt > 1) {
          expect(authorization).toBe('Bearer new-jwt')
          queueMicrotask(() => respond(options, 200, success({ value: options.url })))
        }
        else if (options.url === '/api/late') {
          lateUnauthorized = () => respond(options, 401, unauthorized())
        }
        else {
          queueMicrotask(() => respond(options, 401, unauthorized()))
        }
      }
      return {} as UniApp.RequestTask
    })

    const late = http<{ value: string }>({ url: '/api/late', method: 'GET' })
    const first = await http<{ value: string }>({ url: '/api/first', method: 'GET' })
    lateUnauthorized?.()
    const second = await late

    expect(refreshCalls).toBe(1)
    expect(first.data.value).toBe('/api/first')
    expect(second.data.value).toBe('/api/late')
  })

  it('keeps replay 401 diagnostics and shows only the auth-expired toast', async () => {
    establishSession('expired-jwt', 0)
    let resourceCalls = 0
    vi.mocked(uni.request).mockImplementation((options) => {
      if (options.url === '/api/auth/refresh')
        queueMicrotask(() => respond(options, 200, success({ access_token: 'new-jwt', expires_in: 3600 })))
      else
        queueMicrotask(() => respond(options, 401, { ...unauthorized(), code: 41001, message: 'Token rejected', request_id: `replay-${++resourceCalls}` }))
      return {} as UniApp.RequestTask
    })

    await expect(http({ url: '/api/auth/me', method: 'GET' })).rejects.toMatchObject({
      statusCode: 401,
      code: 41001,
      requestId: 'replay-2',
      message: 'Token rejected',
    })
    expect(uni.showToast).not.toHaveBeenCalled()
    expect(uni.showModal).toHaveBeenCalledTimes(1)
    expect(uni.showModal).toHaveBeenCalledWith({
      title: '登录已过期',
      content: '请重新登录\n\n请求 ID：replay-2',
      showCancel: false,
    })
  })

  it('preserves refresh failure diagnostics without a duplicate normal toast', async () => {
    establishSession('expired-jwt', 0)
    vi.mocked(uni.request).mockImplementation((options) => {
      const body = options.url === '/api/auth/refresh'
        ? { ...unauthorized(), code: 41002, message: 'Refresh rejected', request_id: 'refresh-failed' }
        : unauthorized()
      queueMicrotask(() => respond(options, 401, body))
      return {} as UniApp.RequestTask
    })

    await expect(http({ url: '/api/auth/me', method: 'GET' })).rejects.toMatchObject({
      statusCode: 401,
      code: 41002,
      requestId: 'refresh-failed',
      message: 'Refresh rejected',
    })
    expect(uni.showToast).not.toHaveBeenCalled()
    expect(uni.showModal).toHaveBeenCalledTimes(1)
    expect(uni.showModal).toHaveBeenCalledWith({
      title: '登录已过期',
      content: '请重新登录\n\n请求 ID：refresh-failed',
      showCancel: false,
    })
  })

  it('rejects all waiters, clears once, and shows one prompt when refresh fails', async () => {
    establishSession('expired-jwt', 0)
    vi.mocked(uni.request).mockImplementation((options: CustomRequestOptions) => {
      const body = options.url === '/api/auth/refresh'
        ? { ...unauthorized(), request_id: 'concurrent-refresh-failed' }
        : { ...unauthorized(), request_id: 'concurrent-resource-401' }
      queueMicrotask(() => respond(options, 401, body))
      return {} as UniApp.RequestTask
    })

    const results = await Promise.allSettled([
      http({ url: '/api/auth/me', method: 'GET' }),
      http({ url: '/api/auth/me', method: 'GET' }),
    ])
    expect(results.every(result => result.status === 'rejected')).toBe(true)
    expect(getSession()).toBeNull()
    expect(uni.removeStorageSync).toHaveBeenCalledTimes(1)
    expect(uni.showToast).not.toHaveBeenCalled()
    expect(uni.showModal).toHaveBeenCalledTimes(1)
    expect(uni.showModal).toHaveBeenCalledWith(expect.objectContaining({
      content: '请重新登录\n\n请求 ID：concurrent-refresh-failed',
    }))
  })

  it('never replays an old account request with a new account token', async () => {
    establishSession('account-a', 3600)
    let rejectOldRequest: (() => void) | undefined
    const authorizations: string[] = []
    vi.mocked(uni.request).mockImplementation((options) => {
      authorizations.push((options.header as Record<string, string>)?.Authorization)
      rejectOldRequest = () => respond(options, 401, unauthorized())
      return {} as UniApp.RequestTask
    })

    const oldRequest = http({ url: '/api/auth/password', method: 'PUT', data: { password: 'account-a-change' } })
    establishSession('account-b', 3600)
    rejectOldRequest?.()

    await expect(oldRequest).rejects.toBeInstanceOf(StaleSessionError)
    expect(authorizations).toEqual(['Bearer account-a'])
    expect(getSession()?.accessToken).toBe('account-b')
  })

  it('does not resurrect a cleared session when an old refresh succeeds late', async () => {
    establishSession('account-a', 0)
    let resolveRefresh: (() => void) | undefined
    vi.mocked(uni.request).mockImplementation((options) => {
      if (options.url === '/api/auth/refresh')
        resolveRefresh = () => respond(options, 200, success({ access_token: 'late-account-a', expires_in: 3600 }))
      else
        queueMicrotask(() => respond(options, 401, unauthorized()))
      return {} as UniApp.RequestTask
    })

    const request = http({ url: '/api/auth/me', method: 'GET' })
    await vi.waitFor(() => expect(resolveRefresh).toBeTypeOf('function'))
    clearSession()
    resolveRefresh?.()

    await expect(request).rejects.toBeInstanceOf(StaleSessionError)
    expect(getSession()).toBeNull()
    expect(uni.showToast).not.toHaveBeenCalled()
  })

  it('does not resurrect a password-invalidated generation when refresh succeeds late', async () => {
    establishSession('account-a', 0)
    const passwordGeneration = getSessionGeneration()
    let resolveRefresh: (() => void) | undefined
    vi.mocked(uni.request).mockImplementation((options) => {
      if (options.url === '/api/auth/refresh')
        resolveRefresh = () => respond(options, 200, success({ access_token: 'invalidated-account-a', expires_in: 3600 }))
      else
        queueMicrotask(() => respond(options, 401, unauthorized()))
      return {} as UniApp.RequestTask
    })

    const request = http({ url: '/api/auth/me', method: 'GET' })
    await vi.waitFor(() => expect(resolveRefresh).toBeTypeOf('function'))
    expect(clearSessionIfGenerationCurrent(passwordGeneration)).toBe(true)
    resolveRefresh?.()

    await expect(request).rejects.toBeInstanceOf(StaleSessionError)
    expect(getSession()).toBeNull()
    expect(uni.showToast).not.toHaveBeenCalled()
  })

  it('does not let an old refresh failure clear a newer login', async () => {
    establishSession('account-a', 0)
    let rejectRefresh: (() => void) | undefined
    vi.mocked(uni.request).mockImplementation((options) => {
      if (options.url === '/api/auth/refresh')
        rejectRefresh = () => respond(options, 401, unauthorized())
      else
        queueMicrotask(() => respond(options, 401, unauthorized()))
      return {} as UniApp.RequestTask
    })

    const request = http({ url: '/api/auth/me', method: 'GET' })
    await vi.waitFor(() => expect(rejectRefresh).toBeTypeOf('function'))
    establishSession('account-b', 3600)
    rejectRefresh?.()

    await expect(request).rejects.toBeInstanceOf(StaleSessionError)
    expect(getSession()?.accessToken).toBe('account-b')
    expect(uni.showToast).not.toHaveBeenCalled()
  })

  it('does not return a replay response after the identity changes', async () => {
    establishSession('expired-account-a', 0)
    let resolveReplay: (() => void) | undefined
    let resourceCalls = 0
    vi.mocked(uni.request).mockImplementation((options) => {
      if (options.url === '/api/auth/refresh') {
        queueMicrotask(() => respond(options, 200, success({ access_token: 'rotated-account-a', expires_in: 3600 })))
      }
      else if (++resourceCalls === 1) {
        queueMicrotask(() => respond(options, 401, unauthorized()))
      }
      else {
        resolveReplay = () => respond(options, 200, success({ member: { id: 1 } }))
      }
      return {} as UniApp.RequestTask
    })

    const request = http({ url: '/api/auth/me', method: 'GET' })
    await vi.waitFor(() => expect(resolveReplay).toBeTypeOf('function'))
    establishSession('account-b', 3600)
    resolveReplay?.()

    await expect(request).rejects.toBeInstanceOf(StaleSessionError)
    expect(getSession()?.accessToken).toBe('account-b')
    expect(uni.showToast).not.toHaveBeenCalled()
  })

  it('does not surface a stale replay error after the identity changes', async () => {
    establishSession('expired-account-a', 0)
    let rejectReplay: (() => void) | undefined
    let resourceCalls = 0
    vi.mocked(uni.request).mockImplementation((options) => {
      if (options.url === '/api/auth/refresh') {
        queueMicrotask(() => respond(options, 200, success({ access_token: 'rotated-account-a', expires_in: 3600 })))
      }
      else if (++resourceCalls === 1) {
        queueMicrotask(() => respond(options, 401, unauthorized()))
      }
      else {
        rejectReplay = () => respond(options, 500, {
          success: false,
          code: 500,
          message: 'Stale account failure',
          data: {},
          request_id: 'stale-replay-500',
        })
      }
      return {} as UniApp.RequestTask
    })

    const request = http({ url: '/api/auth/me', method: 'GET' })
    await vi.waitFor(() => expect(rejectReplay).toBeTypeOf('function'))
    establishSession('account-b', 3600)
    rejectReplay?.()

    await expect(request).rejects.toBeInstanceOf(StaleSessionError)
    expect(getSession()?.accessToken).toBe('account-b')
    expect(uni.showToast).not.toHaveBeenCalled()
  })

  it('preserves the session when a replay fails for a non-auth reason', async () => {
    establishSession('expired-jwt', 0)
    let resourceCalls = 0
    vi.mocked(uni.request).mockImplementation((options) => {
      if (options.url === '/api/auth/refresh')
        queueMicrotask(() => respond(options, 200, success({ access_token: 'new-jwt', expires_in: 3600 })))
      else if (++resourceCalls === 1)
        queueMicrotask(() => respond(options, 401, unauthorized()))
      else
        queueMicrotask(() => respond(options, 500, { success: false, code: 500, message: 'Server failure', data: {}, request_id: 'request-500' }))
      return {} as UniApp.RequestTask
    })

    await expect(http({ url: '/api/auth/me', method: 'GET' })).rejects.toMatchObject({ statusCode: 500 })
    expect(getSession()?.accessToken).toBe('new-jwt')
    expect(uni.showToast).not.toHaveBeenCalled()
    expect(uni.showModal).toHaveBeenCalledWith({
      title: '请求失败',
      content: 'Server failure\n\n请求 ID：request-500',
      showCancel: false,
    })
  })

  it('keeps the original network error prompt when no request ID exists', async () => {
    vi.mocked(uni.request).mockImplementation((options) => {
      options.fail?.({ errMsg: 'request:fail' })
      return {} as UniApp.RequestTask
    })

    await expect(http({ url: '/api/public', method: 'GET', auth: 'public' })).rejects.toMatchObject({
      type: 'network',
      message: '网络连接失败，请稍后重试',
    })
    expect(uni.showToast).toHaveBeenCalledWith({ icon: 'none', title: '网络连接失败，请稍后重试' })
    expect(uni.showModal).not.toHaveBeenCalled()
  })

  it('clears only the matching session for account inactive errors', async () => {
    establishSession('inactive-jwt', 3600)
    vi.mocked(uni.request).mockImplementation((options) => {
      queueMicrotask(() => respond(options, 403, {
        success: false,
        code: 403,
        error_code: 'account_inactive',
        message: 'Account disabled',
        data: {},
        errors: {},
        request_id: 'inactive-request',
      }))
      return {} as UniApp.RequestTask
    })

    await expect(http({ url: '/api/auth/me', method: 'GET' })).rejects.toMatchObject({
      code: 403,
      errorCode: 'account_inactive',
      errors: {},
      requestId: 'inactive-request',
    })
    expect(getSession()).toBeNull()
  })

  it('clears an inactive identity after same-generation token rotation', async () => {
    establishSession('old-member-jwt', 3600)
    let rejectInactive: (() => void) | undefined
    vi.mocked(uni.request).mockImplementation((options) => {
      rejectInactive = () => respond(options, 403, {
        success: false,
        code: 403,
        error_code: 'account_inactive',
        message: 'Account disabled',
        data: {},
        errors: {},
        request_id: 'inactive-after-rotation',
      })
      return {} as UniApp.RequestTask
    })

    const request = http({ url: '/api/auth/me', method: 'GET' })
    rotateSession(getSessionIdentity()!, 'rotated-member-jwt', 3600)
    rejectInactive?.()

    await expect(request).rejects.toMatchObject({ errorCode: 'account_inactive' })
    expect(getSession()).toBeNull()
  })

  it('does not clear a session for an ordinary permission 403', async () => {
    establishSession('member-jwt', 3600)
    vi.mocked(uni.request).mockImplementation((options) => {
      queueMicrotask(() => respond(options, 403, {
        success: false,
        code: 403,
        message: 'Forbidden',
        data: {},
        errors: {},
        request_id: 'forbidden-request',
      }))
      return {} as UniApp.RequestTask
    })

    await expect(http({ url: '/api/private', method: 'GET' })).rejects.toMatchObject({ statusCode: 403 })
    expect(getSession()?.accessToken).toBe('member-jwt')
  })
})
