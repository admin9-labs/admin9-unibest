<script lang="ts" setup>
import type { AiAssistant, AiChatAnswer, AiFeedbackCategory } from '@/api/ai-assistants'
import type { StreamTextRenderer } from '@/utils/streamTextRenderer'
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'
import { getAiAssistant, getAiFeedbackCategories, streamAiAssistant, submitAiFeedback } from '@/api/ai-assistants'
import { createStreamTextRenderer } from '@/utils/streamTextRenderer'

definePage({ style: { navigationBarTitleText: 'AI 文旅问答' } })

interface ChatMessage {
  id: number
  question: string
  answer: string
  state: 'streaming' | 'complete' | 'error' | 'cancelled'
  answerData: AiChatAnswer | null
  error: string
  feedbackSent: boolean
  feedbackCategoryId: number | null
}

const id = ref<number | null>(null)
const assistant = ref<AiAssistant | null>(null)
const question = ref('')
const answer = ref<AiChatAnswer | null>(null)
const messages = ref<ChatMessage[]>([])
const categories = ref<AiFeedbackCategory[]>([])
const loading = ref(true)
const notFound = ref(false)
const failed = ref(false)
const asking = ref(false)
const feedbackSubmitting = ref(false)
const feedbackSent = ref(false)
const abortController = ref<AbortController | null>(null)
let activeTextRenderer: StreamTextRenderer | null = null
let messageId = 0

const canSend = computed(() => !!question.value.trim() && !asking.value)

async function scrollToLatestMessage() {
  await nextTick()
  // The page uses normal document scrolling on H5, so this also keeps the composer
  // visible after the keyboard resizes the viewport.
  if (typeof uni.pageScrollTo === 'function')
    uni.pageScrollTo({ scrollTop: 999999, duration: 0 })
}

async function load() {
  if (id.value === null) {
    notFound.value = true
    loading.value = false
    return
  }
  loading.value = true
  notFound.value = false
  failed.value = false
  try {
    assistant.value = await getAiAssistant(id.value)
    try {
      categories.value = await getAiFeedbackCategories()
    }
    catch {
      categories.value = []
    }
    messages.value = [{
      id: ++messageId,
      question: '',
      answer: assistant.value.welcome_message,
      state: 'complete',
      answerData: null,
      error: '',
      feedbackSent: false,
      feedbackCategoryId: categories.value[0]?.id ?? null,
    }]
  }
  catch (error) {
    notFound.value = (error as { statusCode?: number }).statusCode === 404
    failed.value = !notFound.value
  }
  finally {
    loading.value = false
  }
}

async function ask() {
  const message = question.value.trim()
  if (!message) {
    uni.showToast({ icon: 'none', title: '请输入您想了解的问题' })
    return
  }
  if (asking.value)
    return

  const draft: ChatMessage = {
    id: ++messageId,
    question: message,
    answer: '',
    state: 'streaming',
    answerData: null,
    error: '',
    feedbackSent: false,
    feedbackCategoryId: categories.value[0]?.id ?? null,
  }
  messages.value.push(draft)
  question.value = ''
  await runStream(messages.value[messages.value.length - 1])
}

async function runStream(draft: ChatMessage) {
  if (asking.value || id.value === null)
    return
  answer.value = null
  feedbackSent.value = false
  asking.value = true
  const controller = new AbortController()
  const textRenderer = createStreamTextRenderer((content) => {
    draft.answer += content
    void scrollToLatestMessage()
  })
  abortController.value = controller
  activeTextRenderer = textRenderer
  await scrollToLatestMessage()
  try {
    const result = await streamAiAssistant(id.value, draft.question, {
      signal: controller.signal,
      onDelta(content) {
        textRenderer.push(content)
      },
    })
    await textRenderer.drain()
    if (controller.signal.aborted)
      throw controller.signal.reason || new DOMException('Aborted', 'AbortError')
    draft.answerData = result
    draft.answer = result.answer
    draft.state = 'complete'
    answer.value = result
    await scrollToLatestMessage()
  }
  catch (error) {
    textRenderer.cancel()
    if (controller.signal.aborted) {
      draft.state = 'cancelled'
    }
    else {
      draft.state = 'error'
      draft.error = (error as Error).message || '暂时无法回答，请稍后重试'
      uni.showToast({ icon: 'none', title: draft.error })
    }
    await scrollToLatestMessage()
  }
  finally {
    if (abortController.value === controller)
      abortController.value = null
    if (activeTextRenderer === textRenderer)
      activeTextRenderer = null
    asking.value = false
  }
}

async function retry(target: ChatMessage) {
  if (!target.question || asking.value)
    return
  target.answer = ''
  target.answerData = null
  target.error = ''
  target.state = 'streaming'
  await runStream(target)
}

function stop() {
  activeTextRenderer?.cancel()
  abortController.value?.abort()
}

async function feedback(target: ChatMessage | 'helpful' | 'unhelpful', requestedRating?: 'helpful' | 'unhelpful') {
  const message = typeof target === 'string'
    ? [...messages.value].reverse().find(item => item.answerData)
    : target
  const rating = typeof target === 'string' ? target : requestedRating
  const answerData = message?.answerData || answer.value
  if (!message || !rating || !answerData || message.feedbackCategoryId === null || feedbackSubmitting.value || message.feedbackSent)
    return
  feedbackSubmitting.value = true
  try {
    await submitAiFeedback({
      message_reference: answerData.message_reference,
      rating,
      category_id: message.feedbackCategoryId,
    })
    message.feedbackSent = true
    feedbackSent.value = true
    answer.value = answerData
    uni.showToast({ icon: 'success', title: '感谢您的反馈' })
  }
  catch {
    uni.showToast({ icon: 'none', title: '反馈未提交，请稍后再试' })
  }
  finally {
    feedbackSubmitting.value = false
  }
}

function isFeedbackVisible(message: ChatMessage) {
  return message.state === 'complete' && !!message.answerData && !message.feedbackSent && categories.value.length > 0
}

onLoad((query) => {
  const parsed = Number(query?.id)
  id.value = Number.isInteger(parsed) && parsed > 0 ? parsed : null
  load()
})
onBeforeUnmount(() => {
  activeTextRenderer?.cancel()
  abortController.value?.abort()
})

// Kept as a page method for existing callers and focused page tests.
defineExpose({ question, answer, messages, asking, ask, stop, feedback })
</script>

<template>
  <view class="page">
    <view v-if="loading" class="state">
      <wd-loading text="正在加载 AI 助手" />
    </view>
    <view v-else-if="notFound" class="state">
      <wd-empty tip="该 AI 助手不存在或尚未启用" />
    </view>
    <view v-else-if="failed" class="state">
      <wd-empty icon="network" tip="AI 助手暂时无法加载">
        <template #bottom>
          <wd-button size="small" @click="load">
            重新加载
          </wd-button>
        </template>
      </wd-empty>
    </view>
    <template v-else-if="assistant">
      <view class="assistant-header">
        <view class="assistant-mark">
          <wd-icon name="message" size="24" />
        </view>
        <view class="assistant-copy">
          <view class="assistant-name">
            {{ assistant.name }}
          </view>
        </view>
      </view>

      <view class="messages" aria-live="polite">
        <view v-if="!messages.length" class="empty-conversation">
          <view class="empty-title">
            从一个西昌问题开始
          </view>
          <view class="empty-copy">
            可以问景点、线路、餐饮、住宿或游客服务。
          </view>
        </view>
        <view v-for="item in messages" :key="item.id" class="message-group">
          <view v-if="item.question" class="message user-message">
            <view class="message-label">
              您
            </view>
            <view class="bubble user-bubble">
              {{ item.question }}
            </view>
          </view>
          <view class="message assistant-message">
            <view class="message-label">
              {{ assistant.name }}
            </view>
            <view class="bubble assistant-bubble">
              <view v-if="item.answer" class="answer-text">
                {{ item.answer }}
              </view>
              <view v-else-if="item.state === 'streaming'" class="typing">
                <view /><view /><view />
              </view>
              <view v-if="item.state === 'streaming'" class="streaming-label">
                正在整理已审核的西昌文旅信息…
              </view>
              <view v-else-if="item.state === 'cancelled'" class="cancelled-label">
                本次回答已停止
              </view>
              <view v-else-if="item.state === 'error'" class="error-label">
                {{ item.error }}
                <wd-button size="small" plain @click="retry(item)">
                  重试
                </wd-button>
              </view>
              <view v-if="item.answerData" class="answer-meta">
                参考 {{ item.answerData.knowledge_used_count }} 条已审核知识
              </view>
            </view>
            <view v-if="isFeedbackVisible(item)" class="feedback">
              <view class="feedback-title">
                这条回答是否有帮助？
              </view>
              <wd-radio-group v-model="item.feedbackCategoryId" shape="button">
                <wd-radio v-for="category in categories" :key="category.id" :value="category.id">
                  {{ category.name }}
                </wd-radio>
              </wd-radio-group>
              <view class="feedback-actions">
                <wd-button plain :loading="feedbackSubmitting" @click="feedback(item, 'helpful')">
                  有帮助
                </wd-button>
                <wd-button plain type="warning" :loading="feedbackSubmitting" @click="feedback(item, 'unhelpful')">
                  需改进
                </wd-button>
              </view>
            </view>
            <view v-else-if="item.feedbackSent" class="feedback-done">
              反馈已提交
            </view>
          </view>
        </view>
      </view>

      <view class="composer">
        <wd-textarea v-model="question" :maxlength="2000" show-word-limit auto-height adjust-position :cursor-spacing="24" placeholder="例如：邛海周边有哪些适合游览的地方？" />
        <view class="composer-actions">
          <view class="composer-hint">
            回答仅供游览参考，请以官方实时信息为准。
          </view>
          <wd-button v-if="asking" class="stop-button" plain type="warning" @click="stop">
            停止回答
          </wd-button>
          <wd-button v-else class="send-button" size="large" :disabled="!canSend" @click="ask">
            发送问题
          </wd-button>
        </view>
      </view>
    </template>
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  padding: 24rpx 28rpx 38rpx;
  background: var(--lx-color-surface-muted);
  box-sizing: border-box;
}
.state {
  display: flex;
  min-height: 72vh;
  align-items: center;
  justify-content: center;
}
.assistant-header {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background: var(--lx-color-surface);
  border: 1px solid var(--lx-color-border);
  border-radius: 8px;
}
.assistant-mark {
  display: flex;
  width: 68rpx;
  height: 68rpx;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: var(--lx-color-primary-strong);
  border-radius: 8px;
}
.assistant-copy {
  min-width: 0;
  margin-left: 18rpx;
}
.assistant-name {
  color: #17211c;
  font-size: 32rpx;
  font-weight: 700;
  overflow-wrap: anywhere;
}
.welcome {
  margin-top: 6rpx;
  color: #69716c;
  font-size: 24rpx;
  line-height: 1.55;
  overflow-wrap: anywhere;
}
.messages {
  padding: 26rpx 0 12rpx;
}
.empty-conversation {
  padding: 72rpx 20rpx;
  text-align: center;
}
.empty-title {
  color: #25302a;
  font-size: 32rpx;
  font-weight: 650;
}
.empty-copy {
  margin-top: 10rpx;
  color: #7b837f;
  font-size: 24rpx;
}
.message-group + .message-group {
  margin-top: 28rpx;
}
.message {
  display: flex;
  flex-direction: column;
  max-width: 92%;
}
.user-message {
  margin-left: auto;
  align-items: flex-end;
}
.assistant-message {
  margin-right: auto;
  align-items: flex-start;
}
.message-label {
  margin-bottom: 8rpx;
  color: #69716c;
  font-size: 21rpx;
}
.bubble {
  padding: 20rpx 22rpx;
  border-radius: 8px;
  font-size: 27rpx;
  line-height: 1.72;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}
.user-bubble {
  color: #fff;
  background: var(--lx-color-primary-strong);
}
.assistant-bubble {
  min-width: 180rpx;
  color: #25302a;
  background: var(--lx-color-surface);
  border: 1px solid var(--lx-color-border);
}
.answer-text {
  color: #17211c;
}
.answer-meta {
  margin-top: 16rpx;
  color: #7b837f;
  font-size: 21rpx;
  line-height: 1.4;
}
.streaming-label {
  margin-top: 10rpx;
  color: #7b837f;
  font-size: 21rpx;
}
.typing {
  display: flex;
  gap: 8rpx;
  align-items: center;
  min-height: 30rpx;
}
.typing view {
  width: 10rpx;
  height: 10rpx;
  background: var(--lx-color-primary);
  border-radius: 50%;
}
.cancelled-label,
.error-label {
  color: #8c5f48;
  font-size: 24rpx;
}
.feedback {
  width: 100%;
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1px solid #e4e8e5;
}
.feedback-title {
  margin-bottom: 14rpx;
  color: #27312c;
  font-size: 24rpx;
  font-weight: 600;
}
.feedback-actions {
  display: flex;
  gap: 14rpx;
  margin-top: 16rpx;
}
.feedback-done {
  margin-top: 18rpx;
  color: #23744f;
  font-size: 23rpx;
}
.composer {
  position: sticky;
  bottom: 16rpx;
  z-index: 2;
  margin-top: 12rpx;
  padding: 20rpx;
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid #dbe4df;
  border-radius: 8px;
  box-shadow: 0 8rpx 28rpx rgba(38, 49, 43, 0.08);
}
.composer-actions {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 16rpx;
  margin-top: 16rpx;
}
.composer-hint {
  width: 100%;
  color: #7b837f;
  font-size: 20rpx;
  line-height: 1.45;
}
.composer-actions :deep(.wd-button) {
  width: 100%;
  box-sizing: border-box;
}
.stop-button {
  align-self: flex-end;
  width: auto !important;
  min-width: 190rpx;
}
</style>
