import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import PublicServices from './index.vue'

const tokenStore = { hasLogin: false }
vi.mock('@/store/token', () => ({ useTokenStore: () => tokenStore }))

describe('public service entry', () => {
  it('opens guest pages and protected member destinations', async () => {
    const wrapper = mount(PublicServices, { global: { stubs: { WdIcon: true } } })
    const entries = wrapper.findAll('.entry')
    for (const entry of entries)
      await entry.trigger('click')
    expect(uni.navigateTo).toHaveBeenNthCalledWith(1, { url: '/pages/complaints/submit' })
    expect(uni.navigateTo).toHaveBeenNthCalledWith(2, { url: '/pages/complaints/query' })
    expect(uni.navigateTo).toHaveBeenNthCalledWith(3, { url: '/pages/complaints/member-list' })
    expect(uni.navigateTo).toHaveBeenNthCalledWith(4, { url: '/pages/services/index' })
    expect(uni.navigateTo).toHaveBeenNthCalledWith(5, { url: '/pages/consultations/submit' })
    expect(uni.navigateTo).toHaveBeenNthCalledWith(6, { url: '/pages/consultations/query' })
    expect(uni.navigateTo).toHaveBeenNthCalledWith(7, { url: '/pages/consultations/member-list' })
  })
})
