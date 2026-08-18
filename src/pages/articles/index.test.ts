import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import ArticleList from './index.vue'

const { getArticles } = vi.hoisted(() => ({ getArticles: vi.fn() }))
vi.mock('@/api/articles', () => ({ getArticles }))

describe('article list page', () => {
  it('loads published articles and opens an independent detail URL', async () => {
    getArticles.mockResolvedValueOnce([{ id: 401, title: '邛海攻略', summary: '游览参考', category: { id: 41, name: '攻略' }, cover: null }])
    const wrapper = mount(ArticleList, { global: { stubs: { WdButton: true, WdTag: true, WdSearch: true, WdLoading: true, WdEmpty: true, WdImg: true, WdIcon: true, ScrollView: { template: '<div><slot /></div>' } } } })
    await vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.()
    await flushPromises()
    expect(wrapper.text()).toContain('邛海攻略')
    expect(wrapper.text()).toContain('暂无图片')
    expect(wrapper.text()).not.toContain('读懂西昌')
    expect(wrapper.get('.article').classes()).toContain('public-content-card--vertical')
    await wrapper.get('.article').trigger('click')
    expect(uni.navigateTo).toHaveBeenCalledWith({ url: '/pages/articles/detail?id=401' })
  })

  it('does not invent a category when the article has none', async () => {
    getArticles.mockResolvedValueOnce([{ id: 402, title: '西昌资讯', summary: '游览参考', category: null, cover: null }])
    const wrapper = mount(ArticleList, { global: { stubs: { WdButton: true, WdTag: true, WdSearch: true, WdLoading: true, WdEmpty: true, WdImg: true, WdIcon: true, ScrollView: { template: '<div><slot /></div>' } } } })
    await vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.()
    await flushPromises()

    expect(wrapper.text()).toContain('西昌资讯')
    expect(wrapper.find('.public-content-card__eyebrow').exists()).toBe(false)
  })
})
