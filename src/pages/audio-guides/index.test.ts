import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import AudioGuideList from './index.vue'

const { getAudioGuides } = vi.hoisted(() => ({ getAudioGuides: vi.fn() }))
vi.mock('@/api/audio-guides', () => ({ getAudioGuides }))

describe('audio guide list page', () => {
  it('loads playable guides and opens an independent player URL', async () => {
    getAudioGuides.mockResolvedValueOnce([{ id: 501, title: '邛海导览', summary: '湖山讲解', target: { id: 101, name: '邛海泸山景区' } }])
    const wrapper = mount(AudioGuideList, { global: { stubs: { WdButton: true, WdSearch: true, WdLoading: true, WdEmpty: true, WdIcon: true, WdImg: true } } })
    await vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.()
    await flushPromises()
    expect(wrapper.text()).toContain('邛海导览')
    expect(wrapper.text()).toContain('邛海泸山景区')
    expect(wrapper.text()).not.toContain('暂无图片')
    expect(wrapper.text()).not.toContain('戴上耳机')
    await wrapper.get('.guide').trigger('click')
    expect(uni.navigateTo).toHaveBeenCalledWith({ url: '/pages/audio-guides/detail?id=501' })
  })
})
