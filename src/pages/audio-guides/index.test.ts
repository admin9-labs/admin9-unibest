import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import AudioGuideList from './index.vue'

const { getAudioGuides } = vi.hoisted(() => ({ getAudioGuides: vi.fn() }))
vi.mock('@/api/audio-guides', () => ({ getAudioGuides }))

describe('audio guide list page', () => {
  it('loads playable guides and opens an independent player URL', async () => {
    getAudioGuides.mockResolvedValueOnce([{ code: 'lake-audio', title: '邛海导览', summary: '湖山讲解', target: { code: 'qionghai', name: '邛海泸山景区' } }])
    const wrapper = mount(AudioGuideList, { global: { stubs: { WdButton: true, WdSearch: true, WdLoading: true, WdEmpty: true, WdIcon: true } } })
    await vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.()
    await flushPromises()
    expect(wrapper.text()).toContain('邛海导览')
    await wrapper.get('.guide').trigger('click')
    expect(uni.navigateTo).toHaveBeenCalledWith({ url: '/pages/audio-guides/detail?code=lake-audio' })
  })
})
