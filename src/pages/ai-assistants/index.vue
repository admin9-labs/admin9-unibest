<script lang="ts" setup>
import type { AiAssistant } from '@/api/ai-assistants'
import { ref } from 'vue'
import { getAiAssistants } from '@/api/ai-assistants'

definePage({ style: { navigationBarTitleText: 'AI 文旅助手' } })
const assistants = ref<AiAssistant[]>([])
const loading = ref(true)
const failed = ref(false)

async function load() {
  loading.value = true
  failed.value = false
  try {
    assistants.value = await getAiAssistants()
  }
  catch {
    failed.value = true
  }
  finally {
    loading.value = false
  }
}
function open(code: string) {
  uni.navigateTo({ url: `/pages/ai-assistants/chat?code=${encodeURIComponent(code)}` })
}
onLoad(load)
</script>

<template>
  <view class="page">
    <view class="intro">
      <view class="title">
        AI 文旅助手
      </view>
      <view class="copy">
        根据已审核的旅享西昌知识提供游览参考。
      </view>
    </view>
    <view v-if="loading" class="state">
      <wd-loading text="正在加载可用助手" />
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
    <view v-else-if="!assistants.length" class="state">
      <wd-empty tip="当前暂无启用的 AI 文旅助手" />
    </view>
    <view v-else class="list">
      <view v-for="item in assistants" :key="item.code" class="assistant" role="link" @click="open(item.code)">
        <view class="assistant-icon">
          <wd-icon name="chat" size="28" />
        </view>
        <view class="assistant-copy">
          <view class="assistant-name">
            {{ item.name }}
          </view>
          <view class="assistant-description">
            {{ item.description || item.welcome_message }}
          </view>
        </view>
        <wd-icon name="arrow-right" color="#69716c" />
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  padding: 30rpx 28rpx;
  background: #f4f6f3;
  box-sizing: border-box;
}
.intro {
  margin-bottom: 30rpx;
}
.title {
  color: #17211c;
  font-size: 42rpx;
  font-weight: 700;
}
.copy {
  margin-top: 10rpx;
  color: #69716c;
  font-size: 25rpx;
  line-height: 1.6;
}
.state {
  display: flex;
  min-height: 58vh;
  align-items: center;
  justify-content: center;
}
.assistant {
  display: flex;
  min-height: 136rpx;
  align-items: center;
  padding: 24rpx;
  background: #fff;
  border: 1px solid #dbe4df;
  border-radius: 8px;
  box-sizing: border-box;
}
.assistant + .assistant {
  margin-top: 20rpx;
}
.assistant-icon {
  display: flex;
  width: 76rpx;
  height: 76rpx;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: #5d4d78;
  border-radius: 8px;
}
.assistant-copy {
  flex: 1;
  min-width: 0;
  margin: 0 22rpx;
}
.assistant-name {
  color: #17211c;
  font-size: 31rpx;
  font-weight: 600;
}
.assistant-description {
  margin-top: 8rpx;
  color: #69716c;
  font-size: 24rpx;
  line-height: 1.5;
}
</style>
