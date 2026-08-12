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

export type AiAssistant = PublicAiAssistantResource
export type AiChatAnswer = AiChatResource
export type AiFeedbackCategory = AiFeedbackCategoryResource
export type AiFeedbackInput = SubmitPublicAiFeedbackRequest
export type AiFeedbackReceipt = AiFeedbackReceiptResource

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

export async function askAiAssistant(code: string, message: string) {
  const response = await publicAiAssistantsAiAssistantChatUsingPost({
    params: { aiAssistant: code },
    body: { message },
    options: publicOptions,
  })
  return response.data.chat
}

export async function getAiFeedbackCategories() {
  const response = await publicAiFeedbackCategoriesUsingGet({ options: publicOptions })
  return response.data
}

export async function submitAiFeedback(input: AiFeedbackInput) {
  const response = await publicAiFeedbackUsingPost({ body: input, options: publicOptions })
  return response.data.feedback
}
