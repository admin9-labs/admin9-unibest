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
      return {
        assistant: { id: 901, name: '西昌文旅助手' },
        answer: '建议游览邛海。',
        message_reference: 'a'.repeat(64),
        message_reference_expires_at: '2026-08-14T00:00:00Z',
        knowledge_used_count: 2,
        recommendations: [{ type: 'scenic_spot', id: 8, title: '唐园文化街区', summary: '适合夜间漫步', cover: null, address: '西昌市建昌古城片区', duration_minutes: null }],
      }
    })
    api.feedback.mockResolvedValueOnce({ accepted: true, rating: 'helpful', category_id: 91 })
    const wrapper = mount(AiAssistantChat, { global: { stubs: { WdLoading: true, WdEmpty: true, WdButton: true, WdTextarea: { template: '<textarea />' }, WdRadioGroup: true, WdRadio: true, WdIcon: true, WdImg: true } } })
    vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.({ id: '901' })
    await flushPromises()
    const page = wrapper.vm as unknown as {
      question: string
      ask: () => Promise<void>
      feedback: (message: unknown, rating: 'helpful' | 'unhelpful') => Promise<void>
      openRecommendation: (item: { type: 'attraction' | 'scenic_spot' | 'travel_route', id: number }) => void
      messages: Array<{ answerData: unknown }>
    }
    page.question = '邛海怎么玩？'
    const request = page.ask()
    await flushPromises()
    expect(wrapper.text()).not.toContain('建议游览邛海')
    expect(wrapper.text()).not.toContain('唐园文化街区')
    await vi.runAllTimersAsync()
    await request
    expect(wrapper.text()).toContain('建议游览邛海')
    expect(wrapper.text()).toContain('唐园文化街区')
    await wrapper.get('.recommendation-item').trigger('click')
    expect(uni.navigateTo).toHaveBeenCalledWith({ url: '/pages/scenic-spots/detail?id=8' })
    page.openRecommendation({ type: 'attraction', id: 5 })
    page.openRecommendation({ type: 'travel_route', id: 7 })
    expect(uni.navigateTo).toHaveBeenCalledWith({ url: '/pages/attractions/detail?id=5' })
    expect(uni.navigateTo).toHaveBeenCalledWith({ url: '/pages/travel-routes/detail?id=7' })
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

  it('pauses automatic following after a user scrolls up and resumes it near the bottom', async () => {
    vi.useFakeTimers()
    api.detail.mockResolvedValueOnce({ id: 901, name: '西昌文旅助手', description: null, welcome_message: '您好' })
    api.categories.mockResolvedValueOnce([])
    let emitDelta!: (content: string) => void
    let resolveStream!: (answer: Record<string, unknown>) => void
    api.stream.mockImplementationOnce((_id: number, _question: string, options: { onDelta: (content: string) => void }) => new Promise((resolve) => {
      emitDelta = options.onDelta
      resolveStream = resolve
    }))
    const pageScrollTo = vi.fn()
    Object.assign(uni as unknown as Record<string, unknown>, { pageScrollTo })
    const wrapper = mount(AiAssistantChat, { global: { stubs: { WdLoading: true, WdEmpty: true, WdButton: true, WdTextarea: { template: '<textarea />' }, WdRadioGroup: true, WdRadio: true, WdIcon: true } } })
    vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.({ id: '901' })
    await flushPromises()
    const page = wrapper.vm as unknown as {
      question: string
      ask: () => Promise<void>
      autoFollow: boolean
      updateAutoFollowForDistance: (distance: number) => void
    }
    page.question = '邛海怎么玩？'
    const request = page.ask()
    await flushPromises()
    await vi.advanceTimersByTimeAsync(1)
    expect(pageScrollTo).toHaveBeenCalledTimes(1)

    page.updateAutoFollowForDistance(121)
    expect(page.autoFollow).toBe(false)
    emitDelta('上滑阅读时不应被拉回底部。')
    await vi.advanceTimersByTimeAsync(600)
    expect(pageScrollTo).toHaveBeenCalledTimes(1)

    page.updateAutoFollowForDistance(0)
    expect(page.autoFollow).toBe(true)
    emitDelta('回到底部后恢复跟随。')
    await vi.advanceTimersByTimeAsync(96)
    expect(pageScrollTo.mock.calls.length).toBeLessThanOrEqual(2)
    expect(pageScrollTo.mock.calls.length).toBeGreaterThan(1)

    resolveStream({ assistant: { id: 901, name: '西昌文旅助手' }, answer: '上滑阅读时不应被拉回底部。回到底部后恢复跟随。', message_reference: 'a'.repeat(64), message_reference_expires_at: '2026-08-14T00:00:00Z', knowledge_used_count: 2 })
    await vi.runAllTimersAsync()
    await request
  })

  it('keeps displayed text on failure and clears the queue before retrying', async () => {
    vi.useFakeTimers()
    api.detail.mockResolvedValueOnce({ id: 901, name: '西昌文旅助手', description: null, welcome_message: '您好' })
    api.categories.mockResolvedValueOnce([])
    let rejectStream!: (error: Error) => void
    api.stream
      .mockImplementationOnce((_id: number, _question: string, options: { onDelta: (content: string) => void }) => new Promise((_, reject) => {
        options.onDelta('已经显示的内容会被保留，未显示的内容会被清理。')
        rejectStream = reject
      }))
      .mockImplementationOnce(async (_id: number, _question: string, options: { onDelta: (content: string) => void }) => {
        options.onDelta('重试后的完整回答。')
        return { assistant: { id: 901, name: '西昌文旅助手' }, answer: '重试后的完整回答。', message_reference: 'b'.repeat(64), message_reference_expires_at: '2026-08-14T00:00:00Z', knowledge_used_count: 1 }
      })
    const wrapper = mount(AiAssistantChat, { global: { stubs: { WdLoading: true, WdEmpty: true, WdButton: true, WdTextarea: { template: '<textarea />' }, WdRadioGroup: true, WdRadio: true, WdIcon: true } } })
    vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.({ id: '901' })
    await flushPromises()
    const page = wrapper.vm as unknown as { question: string, ask: () => Promise<void>, retry: (message: unknown) => Promise<void>, messages: Array<{ answer: string }> }
    page.question = '请介绍邛海'
    const firstRequest = page.ask()
    await flushPromises()
    await vi.advanceTimersByTimeAsync(24)
    const displayedBeforeFailure = page.messages.at(-1)?.answer || ''
    expect(displayedBeforeFailure).not.toBe('')
    rejectStream(new Error('网络暂时不可用'))
    await firstRequest
    expect(wrapper.text()).toContain('网络暂时不可用')
    expect(page.messages.at(-1)?.answer).toBe(displayedBeforeFailure)

    const retryRequest = page.retry(page.messages.at(-1))
    await vi.runAllTimersAsync()
    await retryRequest
    expect(page.messages.at(-1)?.answer).toBe('重试后的完整回答。')
    expect(wrapper.text()).toContain('回答已完成')
  })

  it('cancels queued rendering when the chat page unmounts', async () => {
    vi.useFakeTimers()
    api.detail.mockResolvedValueOnce({ id: 901, name: '西昌文旅助手', description: null, welcome_message: '您好' })
    api.categories.mockResolvedValueOnce([])
    let emitDelta!: (content: string) => void
    api.stream.mockImplementationOnce((_id: number, _question: string, options: { onDelta: (content: string) => void }) => new Promise(() => {
      emitDelta = options.onDelta
    }))
    const wrapper = mount(AiAssistantChat, { global: { stubs: { WdLoading: true, WdEmpty: true, WdButton: true, WdTextarea: { template: '<textarea />' }, WdRadioGroup: true, WdRadio: true, WdIcon: true } } })
    vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.({ id: '901' })
    await flushPromises()
    const page = wrapper.vm as unknown as { question: string, ask: () => Promise<void> }
    page.question = '请介绍邛海'
    void page.ask()
    await flushPromises()
    emitDelta('卸载后不应继续更新已销毁页面。')
    wrapper.unmount()
    await vi.runAllTimersAsync()
  })
})
