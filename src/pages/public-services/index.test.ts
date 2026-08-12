import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import PublicServices from './index.vue'

const tokenStore = { hasLogin: false }
vi.mock('@/store/token', () => ({ useTokenStore: () => tokenStore }))

describe('public service entry', () => {
  it('opens guest consultation pages and sends signed-out member history to login', async () => {
    const wrapper = mount(PublicServices, { global: { stubs: { WdIcon: true } } })
    const entries = wrapper.findAll('.entry')
    await entries[1].trigger('click')
    await entries[2].trigger('click')
    await entries[3].trigger('click')
    expect(uni.navigateTo).toHaveBeenNthCalledWith(1, { url: '/pages/consultations/submit' })
    expect(uni.navigateTo).toHaveBeenNthCalledWith(2, { url: '/pages/consultations/query' })
    expect(uni.navigateTo).toHaveBeenNthCalledWith(3, { url: '/pages/auth/login?redirect=%2Fpages%2Fconsultations%2Fmember-list' })
  })
})
