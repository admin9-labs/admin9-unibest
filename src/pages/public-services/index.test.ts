import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PublicServices from './index.vue'

const tokenStore = { hasLogin: false }
vi.mock('@/store/token', () => ({ useTokenStore: () => tokenStore }))

describe('public service entry', () => {
  beforeEach(() => {
    tokenStore.hasLogin = false
  })

  it('opens guest pages and protected member destinations', async () => {
    const wrapper = mount(PublicServices)
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

  it('keeps guest credentials and login boundaries visible without redundant row chrome', () => {
    const wrapper = mount(PublicServices)
    expect(wrapper.text()).toContain('游客无需登录，可上传图片凭证')
    expect(wrapper.text()).toContain('游客无需登录即可提交')
    expect(wrapper.findAll('.entry-copy').filter(item => item.text() === '使用工单号与安全查询凭证')).toHaveLength(2)
    expect(wrapper.findAll('.entry-copy').filter(item => item.text() === '登录后查看本人记录')).toHaveLength(2)
    expect(wrapper.find('.public-page-intro').exists()).toBe(false)
    expect(wrapper.find('.entry-icon').exists()).toBe(false)
    expect(wrapper.findComponent({ name: 'WdIcon' }).exists()).toBe(false)
  })

  it('shows member record wording after login', () => {
    tokenStore.hasLogin = true
    const wrapper = mount(PublicServices)
    expect(wrapper.findAll('.entry-copy').filter(item => item.text() === '查看本人已提交记录')).toHaveLength(2)
    expect(wrapper.text()).not.toContain('登录后查看本人记录')
  })
})
