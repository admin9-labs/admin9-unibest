import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import AiAssistantList from './index.vue'

const { getAiAssistants } = vi.hoisted(() => ({ getAiAssistants: vi.fn() }))
vi.mock('@/api/ai-assistants', () => ({ getAiAssistants }))

describe('aI assistant list page', () => {
  it('opens an enabled assistant at its independent URL', async () => {
    getAiAssistants.mockResolvedValueOnce([{ code: 'xichang', name: '西昌文旅助手', description: '游览问答', welcome_message: '您好' }])
    const wrapper = mount(AiAssistantList, { global: { stubs: { WdIcon: true, WdLoading: true, WdEmpty: true, WdButton: true } } })
    await vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.()
    await flushPromises()
    expect(wrapper.text()).toContain('西昌文旅助手')
    await wrapper.get('.assistant').trigger('click')
    expect(uni.navigateTo).toHaveBeenCalledWith({ url: '/pages/ai-assistants/chat?code=xichang' })
  })
})
