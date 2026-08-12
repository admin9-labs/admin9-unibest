import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import ArticleDetail from './detail.vue'

const { getArticle } = vi.hoisted(() => ({ getArticle: vi.fn() }))
vi.mock('@/api/articles', () => ({ getArticle }))

describe('article detail page', () => {
  it('renders sanitized rich content and opens related content', async () => {
    getArticle.mockResolvedValueOnce({ code: 'lake-guide', title: '邛海攻略', subtitle: null, summary: null, content: '<h2>行程参考</h2>', category: { code: 'guide', name: '攻略' }, cover: null, source: null, author: null, published_at: null, relations: [{ relation_type: 'attraction', position: 1, target: { code: 'qionghai', name: '邛海泸山景区' } }] })
    const wrapper = mount(ArticleDetail, { global: { stubs: { WdButton: true, WdLoading: true, WdEmpty: true, WdImg: true, WdIcon: true, RichText: { props: ['nodes'], template: '<div class="rich-stub">{{ nodes }}</div>' } } } })
    vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.({ code: 'lake-guide' })
    await flushPromises()
    expect(wrapper.text()).toContain('行程参考')
    await wrapper.get('.related-item').trigger('click')
    expect(uni.navigateTo).toHaveBeenCalledWith({ url: '/pages/attractions/detail?code=qionghai' })
  })
})
