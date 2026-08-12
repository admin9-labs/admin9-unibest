import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import AudioGuideDetail from './detail.vue'

const { getAudioGuide } = vi.hoisted(() => ({ getAudioGuide: vi.fn() }))
vi.mock('@/api/audio-guides', () => ({ getAudioGuide }))

describe('audio guide player page', () => {
  it('plays real media, links its target and destroys audio on unload', async () => {
    getAudioGuide.mockResolvedValueOnce({ code: 'lake-audio', title: '邛海导览', summary: null, script: '欢迎来到邛海', audio: { url: '/storage/lake.mp3', mime_type: 'audio/mpeg', size: 1024 }, target_type: 'attraction', target: { code: 'qionghai', name: '邛海泸山景区' } })
    const callbacks: Record<string, () => void> = {}
    const audio = { src: '', play: vi.fn(), pause: vi.fn(), destroy: vi.fn(), onPlay: vi.fn((fn) => {
      callbacks.play = fn
    }), onPause: vi.fn((fn) => {
      callbacks.pause = fn
    }), onStop: vi.fn(), onEnded: vi.fn(), onError: vi.fn() }
    vi.mocked(uni.createInnerAudioContext).mockReturnValue(audio as never)
    const wrapper = mount(AudioGuideDetail, { global: { stubs: { WdButton: true, WdLoading: true, WdEmpty: true, WdIcon: true } } })
    vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.({ code: 'lake-audio' })
    await flushPromises()
    expect(audio.src).toBe('/storage/lake.mp3')
    await wrapper.get('.play-button').trigger('click')
    expect(audio.play).toHaveBeenCalled()
    callbacks.play()
    await wrapper.get('.target').trigger('click')
    expect(uni.navigateTo).toHaveBeenCalledWith({ url: '/pages/attractions/detail?code=qionghai' })
    vi.mocked(onUnload).mock.calls.at(-1)?.[0]?.()
    expect(audio.destroy).toHaveBeenCalled()
  })
})
