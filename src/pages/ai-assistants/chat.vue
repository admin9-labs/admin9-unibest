<script lang="ts" setup>
import type { AiAssistant, AiChatAnswer, AiFeedbackCategory } from '@/api/ai-assistants'
import { ref } from 'vue'
import { askAiAssistant, getAiAssistant, getAiFeedbackCategories, submitAiFeedback } from '@/api/ai-assistants'

definePage({ style: { navigationBarTitleText: 'AI 文旅问答' } })
const code = ref('')
const assistant = ref<AiAssistant | null>(null)
const question = ref('')
const answer = ref<AiChatAnswer | null>(null)
const categories = ref<AiFeedbackCategory[]>([])
const selectedCategory = ref('')
const loading = ref(true)
const notFound = ref(false)
const failed = ref(false)
const asking = ref(false)
const feedbackSubmitting = ref(false)
const feedbackSent = ref(false)

async function load() {
  if (!code.value) {
    notFound.value = true
    loading.value = false
    return
  }
  loading.value = true
  notFound.value = false
  failed.value = false
  try {
    assistant.value = await getAiAssistant(code.value)
    categories.value = await getAiFeedbackCategories()
    selectedCategory.value = categories.value[0]?.code || ''
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
  asking.value = true
  feedbackSent.value = false
  answer.value = null
  try {
    answer.value = await askAiAssistant(code.value, message)
  }
  catch (error) {
    const status = (error as { statusCode?: number }).statusCode
    uni.showToast({ icon: 'none', title: status === 429 ? '提问较频繁，请稍后再试' : '暂时无法回答，请稍后重试' })
  }
  finally {
    asking.value = false
  }
}
async function feedback(rating: 'helpful' | 'unhelpful') {
  if (!answer.value || !selectedCategory.value || feedbackSubmitting.value)
    return
  feedbackSubmitting.value = true
  try {
    await submitAiFeedback({
      message_reference: answer.value.message_reference,
      rating,
      category_code: selectedCategory.value,
    })
    feedbackSent.value = true
    uni.showToast({ icon: 'success', title: '感谢您的反馈' })
  }
  catch {
    uni.showToast({ icon: 'none', title: '反馈未提交，请稍后再试' })
  }
  finally {
    feedbackSubmitting.value = false
  }
}
onLoad((query) => {
  code.value = typeof query?.code === 'string' ? decodeURIComponent(query.code) : ''
  load()
})
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
        <view class="assistant-name">
          {{ assistant.name }}
        </view>
        <view class="welcome">
          {{ assistant.welcome_message }}
        </view>
      </view>
      <view class="ask-panel">
        <wd-textarea v-model="question" :maxlength="2000" show-word-limit auto-height placeholder="例如：邛海周边有哪些适合游览的地方？" />
        <wd-button block size="large" :loading="asking" @click="ask">
          发送问题
        </wd-button>
      </view>
      <view v-if="answer" class="answer-panel">
        <view class="answer-label">
          回答
        </view>
        <view class="answer-text">
          {{ answer.answer }}
        </view>
        <view class="answer-meta">
          参考 {{ answer.knowledge_used_count }} 条已审核知识
        </view>
        <view v-if="!feedbackSent && categories.length" class="feedback">
          <view class="feedback-title">
            这条回答是否有帮助？
          </view>
          <wd-radio-group v-model="selectedCategory" shape="button">
            <wd-radio v-for="item in categories" :key="item.code" :value="item.code">
              {{ item.name }}
            </wd-radio>
          </wd-radio-group>
          <view class="feedback-actions">
            <wd-button plain :loading="feedbackSubmitting" @click="feedback('helpful')">
              有帮助
            </wd-button>
            <wd-button plain type="warning" :loading="feedbackSubmitting" @click="feedback('unhelpful')">
              需改进
            </wd-button>
          </view>
        </view>
        <view v-else-if="feedbackSent" class="feedback-done">
          反馈已提交
        </view>
      </view>
      <view class="notice">
        AI 回答仅供游览参考，实时开放、交通和应急信息请以官方渠道为准。
      </view>
    </template>
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  padding: 28rpx;
  background: #f4f6f3;
  box-sizing: border-box;
}
.state {
  display: flex;
  min-height: 72vh;
  align-items: center;
  justify-content: center;
}
.assistant-header,
.ask-panel,
.answer-panel {
  padding: 28rpx 24rpx;
  background: #fff;
  border: 1px solid #dbe4df;
  border-radius: 8px;
}
.ask-panel,
.answer-panel {
  margin-top: 20rpx;
}
.assistant-name {
  color: #17211c;
  font-size: 38rpx;
  font-weight: 700;
}
.welcome {
  margin-top: 12rpx;
  color: #59635e;
  font-size: 26rpx;
  line-height: 1.65;
}
.ask-panel :deep(.wd-button) {
  margin-top: 22rpx;
}
.answer-label {
  color: #5d4d78;
  font-size: 23rpx;
  font-weight: 600;
}
.answer-text {
  margin-top: 12rpx;
  color: #17211c;
  font-size: 29rpx;
  line-height: 1.75;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.answer-meta {
  margin-top: 18rpx;
  color: #7b837f;
  font-size: 22rpx;
}
.feedback {
  margin-top: 28rpx;
  padding-top: 24rpx;
  border-top: 1px solid #e4e8e5;
}
.feedback-title {
  margin-bottom: 16rpx;
  color: #27312c;
  font-size: 26rpx;
  font-weight: 600;
}
.feedback-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 18rpx;
}
.feedback-done {
  margin-top: 24rpx;
  color: #23744f;
  font-size: 25rpx;
}
.notice {
  padding: 24rpx 10rpx;
  color: #7b837f;
  font-size: 22rpx;
  line-height: 1.6;
}
</style>
