import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  askAiAssistant,
  getAiAssistant,
  getAiAssistants,
  getAiFeedbackCategories,
  streamAiAssistant,
  submitAiFeedback,
} from './ai-assistants'

const service = vi.hoisted(() => ({
  list: vi.fn(),
  detail: vi.fn(),
  chat: vi.fn(),
  categories: vi.fn(),
  feedback: vi.fn(),
}))
vi.mock('@/service/aiAssistant', () => ({
  publicAiAssistantsUsingGet: service.list,
  publicAiAssistantsAiAssistantUsingGet: service.detail,
  publicAiAssistantsAiAssistantChatUsingPost: service.chat,
  publicAiFeedbackCategoriesUsingGet: service.categories,
  publicAiFeedbackUsingPost: service.feedback,
}))

describe('public AI assistant API adapter', () => {
  beforeEach(() => {
    service.list.mockResolvedValue({ data: [] })
    service.detail.mockResolvedValue({ data: { ai_assistant: { code: 'travel', name: '旅游助手' } } })
    service.chat.mockResolvedValue({ data: { chat: { answer: '回答' } } })
    service.categories.mockResolvedValue({ data: [{ code: 'accuracy', name: '准确性' }] })
    service.feedback.mockResolvedValue({ data: { feedback: { accepted: true } } })
  })

  it('uses public auth for discovery and chat', async () => {
    await getAiAssistants()
    await getAiAssistant('travel')
    await askAiAssistant('travel', '邛海怎么玩？')
    expect(service.chat).toHaveBeenCalledWith(expect.objectContaining({
      params: { aiAssistant: 'travel' },
      body: { message: '邛海怎么玩？' },
      options: { auth: 'public', hideErrorToast: true },
    }))
  })

  it('loads server categories and submits only the trusted reference', async () => {
    await getAiFeedbackCategories()
    await submitAiFeedback({ message_reference: 'a'.repeat(64), rating: 'helpful', category_code: 'accuracy' })
    expect(service.feedback).toHaveBeenCalledWith(expect.objectContaining({
      body: { message_reference: 'a'.repeat(64), rating: 'helpful', category_code: 'accuracy' },
    }))
  })

  it('parses split SSE frames and returns the complete trusted answer', async () => {
    const chunks = [
      'event: start\ndata: {"assistant":{"code":"travel","name":"旅游助手"}}\n\n',
      'event: delta\ndata: {"content":"邛海"}\n\n',
      'event: delta\ndata: {"content":"适合游览。"}\n\n',
      'event: complete\ndata: {"answer":"邛海适合游览。","message_reference":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","message_reference_expires_at":"2026-08-14T00:00:00Z","knowledge_used_count":2}\n\n',
    ]
    const reader = {
      read: vi.fn()
        .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('event: start\n') })
        .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode(`${chunks[0].slice('event: start\n'.length)}event: delta\n`) })
        .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode(`${chunks[1].slice('event: delta\n'.length)}${chunks[2]}event: complete\n`) })
        .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode(chunks[3].slice('event: complete\n'.length)) })
        .mockResolvedValueOnce({ done: true, value: undefined }),
    }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'text/event-stream' }),
      body: { getReader: () => reader },
    }))
    const deltas: string[] = []
    await expect(streamAiAssistant('travel', '邛海怎么样？', { onDelta: content => deltas.push(content) })).resolves.toMatchObject({
      answer: '邛海适合游览。',
      knowledge_used_count: 2,
      assistant: { code: 'travel' },
    })
    expect(deltas).toEqual(['邛海', '适合游览。'])
  })

  it('stops before emitting a JSON fallback answer', async () => {
    const originalFetch = globalThis.fetch
    vi.stubGlobal('fetch', undefined)
    const controller = new AbortController()
    let resolveChat: (value: unknown) => void = () => {}
    service.chat.mockReturnValue(new Promise((resolve) => {
      resolveChat = resolve
    }))
    const stream = streamAiAssistant('travel', '问题', { signal: controller.signal })

    controller.abort()
    resolveChat({ data: { chat: { answer: '不应显示' } } })

    await expect(stream).rejects.toThrow()
    vi.stubGlobal('fetch', originalFetch)
  })

  it('maps stream read failures to an actionable network message', async () => {
    const reader = { read: vi.fn().mockRejectedValue(new TypeError('Failed to fetch')) }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'text/event-stream' }),
      body: { getReader: () => reader },
    }))

    await expect(streamAiAssistant('travel', '问题')).rejects.toThrow('网络连接已中断，请检查网络后重试')
  })

  it('falls back to JSON when the stream endpoint returns JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ data: { chat: { assistant: { code: 'travel', name: '旅游助手' }, answer: '回答', message_reference: 'a'.repeat(64), message_reference_expires_at: '2026-08-14T00:00:00Z', knowledge_used_count: 0 } } }),
    }))
    await expect(streamAiAssistant('travel', '问题')).resolves.toMatchObject({ answer: '回答' })
  })

  it('maps pre-stream rate limits and network failures to actionable messages', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 429,
    }))
    await expect(streamAiAssistant('travel', '问题')).rejects.toThrow('提问较频繁，请稍后再试')

    vi.stubGlobal('fetch', vi.fn().mockRejectedValueOnce(new TypeError('Failed to fetch')))
    await expect(streamAiAssistant('travel', '问题')).rejects.toThrow('网络连接不可用，请检查网络后重试')
  })
})
