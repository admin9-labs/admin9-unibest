<script lang="ts" setup>
import type { AudioGuide } from '@/api/audio-guides'
import { ref } from 'vue'
import { getAudioGuides } from '@/api/audio-guides'

defineOptions({ name: 'AudioGuideList' })
definePage({ style: { navigationBarTitleText: '语音导览' } })
const keyword = ref('')
const guides = ref<AudioGuide[]>([])
const loading = ref(true)
const failed = ref(false)
async function load() {
  loading.value = true
  failed.value = false
  try {
    guides.value = await getAudioGuides(keyword.value.trim())
  }
  catch {
    failed.value = true
  }
  finally {
    loading.value = false
  }
}
function openGuide(id: number) {
  uni.navigateTo({ url: `/pages/audio-guides/detail?id=${id}` })
}
onLoad(load)
</script>

<template>
  <view class="page">
    <view class="page-content">
      <wd-search v-model="keyword" placeholder="搜索导览标题" hide-cancel :maxlength="120" @search="load" @clear="load" />
      <view v-if="loading" class="state">
        <wd-loading text="正在加载语音导览" />
      </view>
      <view v-else-if="failed" class="state">
        <wd-empty icon="network" tip="语音导览暂时无法加载">
          <template #bottom>
            <wd-button size="small" @click="load">
              重新加载
            </wd-button>
          </template>
        </wd-empty>
      </view>
      <view v-else-if="guides.length === 0" class="state">
        <wd-empty tip="暂无可播放的语音导览" />
      </view>
      <view v-else class="guide-list">
        <view
          v-for="guide in guides"
          :key="guide.id"
          class="guide"
          role="link"
          hover-class="guide--pressed"
          @click="openGuide(guide.id)"
        >
          <view class="guide-icon">
            <wd-icon name="play-circle" size="28" />
          </view>
          <view class="guide-body">
            <view class="guide-title">
              {{ guide.title }}
            </view>
            <view v-if="guide.summary" class="guide-summary">
              {{ guide.summary }}
            </view>
            <view class="guide-target">
              <wd-icon name="location" size="15" />
              <text>{{ guide.target.name }}</text>
            </view>
          </view>
          <wd-icon name="arrow-right" size="17" color="#7b8988" />
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  padding: 20rpx 24rpx calc(40rpx + env(safe-area-inset-bottom));
  background: var(--lx-color-surface-muted);
  box-sizing: border-box;
}

.page-content {
  width: 100%;
  max-width: 960rpx;
  margin: 0 auto;
}

.state {
  display: flex;
  min-height: 520rpx;
  align-items: center;
  justify-content: center;
}
.guide-list {
  margin-top: 24rpx;
}

.guide {
  display: grid;
  grid-template-columns: 68rpx minmax(0, 1fr) 28rpx;
  min-height: 148rpx;
  align-items: center;
  gap: 20rpx;
  padding: 22rpx 0;
  border-bottom: 1px solid var(--lx-color-border);
  box-sizing: border-box;
}

.guide--pressed {
  background: var(--lx-color-surface-pressed);
}

.guide-icon {
  display: flex;
  width: 68rpx;
  height: 68rpx;
  align-items: center;
  justify-content: center;
  color: var(--lx-color-primary);
}

.guide-body {
  min-width: 0;
}

.guide-title {
  color: var(--lx-color-text-main);
  font-size: 30rpx;
  font-weight: 650;
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.guide-summary {
  display: -webkit-box;
  margin-top: 8rpx;
  overflow: hidden;
  color: var(--lx-color-text-secondary);
  font-size: 24rpx;
  line-height: 1.55;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.guide-target {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  gap: 8rpx;
  margin-top: 10rpx;
  color: var(--lx-color-primary);
  font-size: 22rpx;
  line-height: 1.5;
}

.guide-target text {
  min-width: 0;
  overflow-wrap: anywhere;
}

@media (min-width: 760px) {
  .guide {
    grid-template-columns: 72px minmax(0, 1fr) 28px;
    min-height: 148px;
    gap: 28px;
    padding: 24px 0;
  }

  .guide-icon {
    width: 72px;
    height: 72px;
  }

  .guide-title {
    font-size: 22px;
  }

  .guide-summary {
    font-size: 15px;
  }
}
</style>
