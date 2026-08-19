import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import AiAssistantChat from './chat.vue'

const api = vi.hoisted(() => ({ detail: vi.fn(), categories: vi.fn(), stream: vi.fn(), feedback: vi.fn() }))
vi.mock('@/api/ai-assistants', () => ({
  getAiAssistant: api.detail,
  getAiFeedbackCategories: api.categories,
  streamAiAssistant: api.stream,
  submitAiFeedback: api.feedback,
}))

describe('ai assistant chat page', () => {
  afterEach(() => vi.useRealTimers())

  it('streams a real assistant answer and submits feedback with only its reference', async () => {
    vi.useFakeTimers()
    api.detail.mockResolvedValueOnce({ id: 901, name: '西昌文旅助手', description: null, welcome_message: '您好' })
    api.categories.mockResolvedValueOnce([{ id: 91, name: '信息准确性' }])
    api.stream.mockImplementationOnce(async (_id: number, _question: string, options: { onDelta: (content: string) => void }) => {
      options.onDelta('建议游览')
      options.onDelta('邛海。')
      return { assistant: { id: 901, name: '西昌文旅助手' }, answer: '建议游览邛海。', message_reference: 'a'.repeat(64), message_reference_expires_at: '2026-08-14T00:00:00Z', knowledge_used_count: 2 }
    })
    api.feedback.mockResolvedValueOnce({ accepted: true, rating: 'helpful', category_id: 91 })
    const wrapper = mount(AiAssistantChat, { global: { stubs: { WdLoading: true, WdEmpty: true, WdButton: true, WdTextarea: { template: '<textarea />' }, WdRadioGroup: true, WdRadio: true, WdIcon: true } } })
    vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.({ id: '901' })
    await flushPromises()
    const page = wrapper.vm as unknown as { question: string, ask: () => Promise<void>, feedback: (message: unknown, rating: 'helpful' | 'unhelpful') => Promise<void>, messages: Array<{ answerData: unknown }> }
    page.question = '邛海怎么玩？'
    const request = page.ask()
    await flushPromises()
    expect(wrapper.text()).not.toContain('建议游览邛海')
    await vi.runAllTimersAsync()
    await request
    expect(wrapper.text()).toContain('建议游览邛海')
    await page.feedback(page.messages.at(-1), 'helpful')
    expect(api.feedback).toHaveBeenCalledWith({ message_reference: 'a'.repeat(64), rating: 'helpful', category_id: 91 })
    expect(wrapper.text()).toContain('反馈已提交')
  })

  it('stops an in-flight answer with AbortController', async () => {
    api.detail.mockResolvedValueOnce({ id: 901, name: '西昌文旅助手', description: null, welcome_message: '您好' })
    api.categories.mockResolvedValueOnce([])
    let rejectStream!: (error: Error) => void
    api.stream.mockReturnValueOnce(new Promise((_, reject) => {
      rejectStream = reject
    }))
    const wrapper = mount(AiAssistantChat, { global: { stubs: { WdLoading: true, WdEmpty: true, WdButton: true, WdTextarea: { template: '<textarea />' }, WdRadioGroup: true, WdRadio: true, WdIcon: true } } })
    vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.({ id: '901' })
    await flushPromises()
    const page = wrapper.vm as unknown as { question: string, ask: () => Promise<void>, stop: () => void }
    page.question = '请介绍邛海'
    const request = page.ask()
    page.stop()
    rejectStream(Object.assign(new Error('aborted'), { name: 'AbortError' }))
    await request
    expect(wrapper.text()).toContain('本次回答已停止')
  })

  it('stops queued text after the network stream has completed', async () => {
    vi.useFakeTimers()
    api.detail.mockResolvedValueOnce({ id: 901, name: '西昌文旅助手', description: null, welcome_message: '您好' })
    api.categories.mockResolvedValueOnce([])
    api.stream.mockImplementationOnce(async (_id: number, _question: string, options: { onDelta: (content: string) => void }) => {
      options.onDelta('这段回答仍在逐字显示')
      return { assistant: { id: 901, name: '西昌文旅助手' }, answer: '这段回答仍在逐字显示', message_reference: 'a'.repeat(64), message_reference_expires_at: '2026-08-14T00:00:00Z', knowledge_used_count: 2 }
    })
    const wrapper = mount(AiAssistantChat, { global: { stubs: { WdLoading: true, WdEmpty: true, WdButton: true, WdTextarea: { template: '<textarea />' }, WdRadioGroup: true, WdRadio: true, WdIcon: true } } })
    vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.({ id: '901' })
    await flushPromises()
    const page = wrapper.vm as unknown as { question: string, ask: () => Promise<void>, stop: () => void }
    page.question = '请介绍邛海'

    const request = page.ask()
    await flushPromises()
    page.stop()
    await request

    expect(wrapper.text()).toContain('本次回答已停止')
    expect(wrapper.text()).not.toContain('这段回答仍在逐字显示')
  })

  it('keeps chat available when feedback categories cannot load', async () => {
    api.detail.mockResolvedValueOnce({ id: 901, name: '西昌文旅助手', description: null, welcome_message: '您好' })
    api.categories.mockRejectedValueOnce(new Error('categories unavailable'))
    const wrapper = mount(AiAssistantChat, { global: { stubs: { WdLoading: true, WdEmpty: true, WdButton: true, WdTextarea: { template: '<textarea />' }, WdRadioGroup: true, WdRadio: true, WdIcon: true } } })

    vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.({ id: '901' })
    await flushPromises()

    expect(wrapper.text()).toContain('您好')
    expect(wrapper.find('.send-button').exists()).toBe(true)
    expect(wrapper.text()).not.toContain('AI 助手暂时无法加载')
  })
})
