import { beforeEach, describe, expect, it, vi } from 'vitest'
import { navigateToInterceptor } from './interceptor'

const authState = vi.hoisted(() => ({ hasLogin: false }))

vi.mock('@/store/token', () => ({
  useTokenStore: () => authState,
}))

vi.mock('@/utils/index', () => ({
  getAllPages: () => [{ path: '/pages/me/me' }],
  getLastPage: () => ({ route: '/pages/index/index' }),
  HOME_PAGE: '/pages/index/index',
}))

describe('authentication route interceptor', () => {
  beforeEach(() => {
    authState.hasLogin = false
  })

  it('does not throw on malformed percent encoding before the login page loads', () => {
    expect(() => navigateToInterceptor.invoke({
      url: '/pages/me/me?broken=%E0%A4%A',
    })).not.toThrow()

    expect(uni.navigateTo).toHaveBeenCalledWith({
      url: expect.stringMatching(/^\/pages\/auth\/login\?redirect=/),
    })
  })

  it('uses the canonical auth redirect boundary for an already signed-in login route', () => {
    authState.hasLogin = true

    expect(navigateToInterceptor.invoke({
      url: '/pages/auth/login?redirect=%E0%A4%A',
    })).toBe(false)
    expect(uni.reLaunch).toHaveBeenCalledWith({ url: '/pages/me/me' })
    expect(uni.switchTab).not.toHaveBeenCalled()
  })
})
