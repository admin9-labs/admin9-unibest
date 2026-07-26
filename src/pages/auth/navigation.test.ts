import { beforeEach, describe, expect, it, vi } from 'vitest'
import { navigateAfterLogin } from './navigation'

describe('navigateAfterLogin', () => {
  beforeEach(() => {
    vi.mocked(getCurrentPages).mockReturnValue([{ route: 'pages/auth/login' }] as any)
  })

  it.each([
    '/pages/me/me',
    '%2Fpages%2Fme%2Fme',
    '%252Fpages%252Fme%252Fme',
  ])('normalizes a protected Me tab redirect with switchTab: %s', (redirect) => {
    navigateAfterLogin(redirect)
    expect(uni.switchTab).toHaveBeenCalledWith({ url: '/pages/me/me' })
    expect(uni.reLaunch).not.toHaveBeenCalled()
  })

  it('preserves the query when relaunching an encoded non-tab redirect', () => {
    navigateAfterLogin('%2Fpages%2Faccount%2Fdetail%3Fid%3D1%26tab%3Dsecurity')
    expect(uni.reLaunch).toHaveBeenCalledWith({ url: '/pages/account/detail?id=1&tab=security' })
    expect(uni.switchTab).not.toHaveBeenCalled()
  })

  it('strips query parameters before switching to a Tab page', () => {
    navigateAfterLogin('%2Fpages%2Fme%2Fme%3Fsource%3Dlogin')
    expect(uni.switchTab).toHaveBeenCalledWith({ url: '/pages/me/me' })
    expect(uni.reLaunch).not.toHaveBeenCalled()
  })

  it.each([
    undefined,
    '',
    '%E0%A4%A',
    'https%3A%2F%2Fexample.com%2Faccount',
    'http%3A%2F%2Fexample.com%2Faccount',
    '%252F%252Fevil.example%252Faccount',
    '/%2Fevil.example/account',
    '%2Fpages%2Fme%5Cme',
    '%2Fpages%2Fme%2Fme%00',
    '%2Fpages%2Fme%2Fme%23fragment',
  ])('defaults to Me for an absent or unsafe redirect: %s', (redirect) => {
    navigateAfterLogin(redirect)
    expect(uni.switchTab).toHaveBeenCalledWith({ url: '/pages/me/me' })
    expect(uni.reLaunch).not.toHaveBeenCalled()
  })

  it('keeps the existing direct-login navigateBack behavior', () => {
    vi.mocked(getCurrentPages).mockReturnValue([
      { route: 'pages/index/index' },
      { route: 'pages/auth/login' },
    ] as any)
    navigateAfterLogin()
    expect(uni.navigateBack).toHaveBeenCalledTimes(1)
    expect(uni.switchTab).not.toHaveBeenCalled()
  })
})
