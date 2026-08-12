import type {
  AiChatResource,
  AiFeedbackCategoryResource,
  AiFeedbackReceiptResource,
  PublicAiAssistantResource,
  SubmitPublicAiFeedbackRequest,
} from '@/service/types'
import {
  publicAiAssistantsAiAssistantChatUsingPost,
  publicAiAssistantsAiAssistantUsingGet,
  publicAiAssistantsUsingGet,
  publicAiFeedbackCategoriesUsingGet,
  publicAiFeedbackUsingPost,
} from '@/service/aiAssistant'
import { getEnvBaseUrl } from '@/utils/baseUrl'

export type AiAssistant = PublicAiAssistantResource
export type AiChatAnswer = AiChatResource
export type AiFeedbackCategory = AiFeedbackCategoryResource
export type AiFeedbackInput = SubmitPublicAiFeedbackRequest
export type AiFeedbackReceipt = AiFeedbackReceiptResource

export interface AiChatStreamOptions {
  signal?: AbortSignal
  onDelta?: (content: string) => void
  onEvent?: (event: AiChatStreamEvent) => void
}

export type AiChatStreamEvent
  = | { event: 'start', data: { assistant: { code: string, name: string } } }
    | { event: 'delta', data: { content: string } }
    | { event: 'complete', data: Omit<AiChatAnswer, 'assistant'> }
    | { event: 'error', data: { error_code?: string } }

const publicOptions = { auth: 'public' as const, hideErrorToast: true }

export async function getAiAssistants() {
  const response = await publicAiAssistantsUsingGet({ options: publicOptions })
  return response.data
}

export async function getAiAssistant(code: string) {
  const response = await publicAiAssistantsAiAssistantUsingGet({
    params: { aiAssistant: code },
    options: publicOptions,
  })
  return response.data.ai_assistant
}

/** JSON chat remains available as the compatibility fallback for clients without fetch. */
export async function askAiAssistant(code: string, message: string) {
  const response = await publicAiAssistantsAiAssistantChatUsingPost({
    params: { aiAssistant: code },
    body: { message },
    options: publicOptions,
  })
  return response.data.chat
}

export async function streamAiAssistant(code: string, message: string, options: AiChatStreamOptions = {}): Promise<AiChatAnswer> {
  if (typeof globalThis.fetch !== 'function') {
    if (options.signal?.aborted)
      throw options.signal.reason || new DOMException('Aborted', 'AbortError')
    const answer = await askAiAssistant(code, message)
    if (options.signal?.aborted)
      throw options.signal.reason || new DOMException('Aborted', 'AbortError')
    options.onDelta?.(answer.answer)
    return answer
  }

  let response: Response
  try {
    response = await fetch(resolveStreamUrl(code), {
      method: 'POST',
      headers: {
        'Accept': 'text/event-stream, application/json',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
      body: JSON.stringify({ message }),
      signal: options.signal,
    })
  }
  catch (error) {
    if (options.signal?.aborted)
      throw error
    throw new Error('网络连接不可用，请检查网络后重试')
  }

  if (!response.ok)
    throw await responseError(response)

  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    const envelope = await response.json() as { data?: { chat?: AiChatAnswer }, chat?: AiChatAnswer, message?: string }
    const answer = envelope.data?.chat || envelope.chat
    if (!answer)
      throw new Error(envelope.message || 'AI 助手返回了无效结果')
    if (options.signal?.aborted)
      throw options.signal.reason || new DOMException('Aborted', 'AbortError')
    options.onDelta?.(answer.answer)
    return answer
  }

  if (!response.body)
    throw new Error('AI 助手暂时无法建立流式连接')

  const decoder = new TextDecoder()
  const reader = response.body.getReader()
  let buffer = ''
  let currentEvent = ''
  let currentData: string[] = []
  let assistant: AiChatAnswer['assistant'] | undefined
  let complete: Omit<AiChatAnswer, 'assistant'> | undefined

  const dispatch = (event: string, dataText: string) => {
    if (!dataText)
      return
    let data: unknown
    try {
      data = JSON.parse(dataText)
    }
    catch {
      throw new Error('AI 助手返回了无效的流式数据')
    }
    if (event === 'start') {
      const typed = { event: 'start', data } as AiChatStreamEvent
      assistant = (data as Extract<AiChatStreamEvent, { event: 'start' }>['data']).assistant
      options.onEvent?.(typed)
      return
    }
    if (event === 'delta') {
      const content = typeof (data as { content?: unknown }).content === 'string' ? (data as { content: string }).content : ''
      const typed = { event: 'delta', data: { content } } as AiChatStreamEvent
      options.onEvent?.(typed)
      if (content)
        options.onDelta?.(content)
      return
    }
    if (event === 'complete') {
      complete = data as Omit<AiChatAnswer, 'assistant'>
      options.onEvent?.({ event: 'complete', data: complete })
      return
    }
    if (event === 'error') {
      const typed = { event: 'error', data: data as { error_code?: string } } as AiChatStreamEvent
      options.onEvent?.(typed)
      throw new Error(streamErrorMessage((data as Extract<AiChatStreamEvent, { event: 'error' }>['data']).error_code))
    }
  }

  const consume = (chunk: string, final = false) => {
    buffer += chunk
    const lines = buffer.split(/\r\n|\n|\r/)
    buffer = final ? '' : (lines.pop() || '')
    for (const line of lines) {
      if (!line) {
        dispatch(currentEvent, currentData.join('\n'))
        currentEvent = ''
        currentData = []
      }
      else if (line.startsWith('event:')) {
        currentEvent = line.slice(6).trim()
      }
      else if (line.startsWith('data:')) {
        currentData.push(line.slice(5).trimStart())
      }
    }
    if (final)
      dispatch(currentEvent, currentData.join('\n'))
  }

  try {
    while (true) {
      const result = await reader.read()
      if (result.done)
        break
      consume(decoder.decode(result.value, { stream: true }))
    }
    consume(decoder.decode(), true)
  }
  catch (error) {
    if (options.signal?.aborted)
      throw error
    if (error instanceof Error && error.message.startsWith('AI 助手'))
      throw error
    throw new Error('网络连接已中断，请检查网络后重试')
  }

  if (!complete)
    throw new Error('AI 助手未完成本次回答')
  return {
    ...complete,
    assistant: assistant || { code, name: code },
  }
}

export async function getAiFeedbackCategories() {
  const response = await publicAiFeedbackCategoriesUsingGet({ options: publicOptions })
  return response.data
}

export async function submitAiFeedback(input: AiFeedbackInput) {
  const response = await publicAiFeedbackUsingPost({ body: input, options: publicOptions })
  return response.data.feedback
}

function resolveStreamUrl(code: string) {
  const path = `/api/public/ai-assistants/${encodeURIComponent(code)}/chat/stream`
  // H5 dev/prod uses the same-origin API path so Vite or the deployed host can proxy it.
  if (import.meta.env.DEV)
    return path
  return `${getEnvBaseUrl()}${path}`
}

async function responseError(response: Response) {
  if (response.status === 429) {
    return Object.assign(new Error('提问较频繁，请稍后再试'), {
      statusCode: response.status,
      errorCode: 'RATE_LIMITED',
    })
  }
  let message = `请求失败 (${response.status})`
  let payload: { message?: string, error_code?: string } | undefined
  try {
    payload = await response.clone().json() as typeof payload
    message = payload.message || message
  }
  catch {
    // The status still gives the caller enough information for a safe UI message.
  }
  return Object.assign(new Error(message), {
    statusCode: response.status,
    errorCode: payload?.error_code,
  })
}

function streamErrorMessage(errorCode?: string) {
  if (errorCode === 'ai_provider_rate_limited')
    return '提问较频繁，请稍后再试'
  if (errorCode === 'ai_provider_unavailable' || errorCode === 'ai_provider_timeout')
    return 'AI 助手暂时无法回答，请稍后重试'
  return 'AI 助手暂时无法回答，请稍后重试'
}
