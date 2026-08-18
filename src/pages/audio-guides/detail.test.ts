import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import AudioGuideDetail from './detail.vue'

const { getAudioGuide } = vi.hoisted(() => ({ getAudioGuide: vi.fn() }))
vi.mock('@/api/audio-guides', () => ({ getAudioGuide }))

describe('audio guide player page', () => {
  it('plays real media, links its target and destroys audio on unload', async () => {
    getAudioGuide.mockResolvedValueOnce({ id: 501, title: '邛海导览', summary: null, script: '欢迎来到邛海', audio: { url: '/storage/lake.mp3', mime_type: 'audio/mpeg', size: 1024 }, target_type: 'attraction', target: { id: 101, name: '邛海泸山景区' } })
    const callbacks: Record<string, () => void> = {}
    const audio = { src: '', play: vi.fn(), pause: vi.fn(), destroy: vi.fn(), onPlay: vi.fn((fn) => {
      callbacks.play = fn
    }), onPause: vi.fn((fn) => {
      callbacks.pause = fn
    }), onStop: vi.fn(), onEnded: vi.fn((fn) => {
      callbacks.ended = fn
    }), onError: vi.fn((fn) => {
      callbacks.error = fn
    }) }
    vi.mocked(uni.createInnerAudioContext).mockReturnValue(audio as never)
    const wrapper = mount(AudioGuideDetail, { global: { stubs: { WdButton: true, WdLoading: true, WdEmpty: true, WdIcon: true } } })
    vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.({ id: '501' })
    await flushPromises()
    expect(audio.src).toBe('/storage/lake.mp3')
    expect(wrapper.text()).not.toContain('语音导览')
    expect(wrapper.text()).not.toContain('本导览关联')
    expect(wrapper.text().match(/关联内容/g)).toHaveLength(1)
    expect(wrapper.findAll('.sound-wave__bar')).toHaveLength(3)
    await wrapper.get('.play-button').trigger('click')
    expect(audio.play).toHaveBeenCalled()
    callbacks.play()
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('正在播放')
    callbacks.error()
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('音频播放失败')
    await wrapper.get('.target').trigger('click')
    expect(uni.navigateTo).toHaveBeenCalledWith({ url: '/pages/attractions/detail?id=101' })
    vi.mocked(onUnload).mock.calls.at(-1)?.[0]?.()
    expect(audio.destroy).toHaveBeenCalled()
  })

  it('shows unavailable details without creating an audio context', async () => {
    getAudioGuide.mockRejectedValueOnce({ statusCode: 404 })
    const wrapper = mount(AudioGuideDetail, { global: { stubs: { WdButton: true, WdLoading: true, WdEmpty: { props: ['tip'], template: '<div>{{ tip }}</div>' }, WdIcon: true } } })
    vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.({ id: '999' })
    await flushPromises()
    expect(wrapper.text()).toContain('不存在或暂不可播放')
    expect(uni.createInnerAudioContext).not.toHaveBeenCalled()
  })
})
