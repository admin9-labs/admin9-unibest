import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  askAiAssistant,
  getAiAssistant,
  getAiAssistants,
  getAiFeedbackCategories,
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
})
