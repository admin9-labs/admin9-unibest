import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import ArticleList from './index.vue'

const { getArticles } = vi.hoisted(() => ({ getArticles: vi.fn() }))
vi.mock('@/api/articles', () => ({ getArticles }))

describe('article list page', () => {
  it('loads published articles and opens an independent detail URL', async () => {
    getArticles.mockResolvedValueOnce([{ code: 'lake-guide', title: '邛海攻略', summary: '游览参考', category: { code: 'guide', name: '攻略' }, cover: null }])
    const wrapper = mount(ArticleList, { global: { stubs: { WdButton: true, WdTag: true, WdSearch: true, WdLoading: true, WdEmpty: true, WdImg: true, WdIcon: true } } })
    await vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.()
    await flushPromises()
    expect(wrapper.text()).toContain('邛海攻略')
    await wrapper.get('.article').trigger('click')
    expect(uni.navigateTo).toHaveBeenCalledWith({ url: '/pages/articles/detail?code=lake-guide' })
  })
})
