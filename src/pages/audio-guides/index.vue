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
function openGuide(code: string) {
  uni.navigateTo({ url: `/pages/audio-guides/detail?code=${encodeURIComponent(code)}` })
}
onLoad(load)
</script>

<template>
  <view class="page">
    <view class="intro">
      <text class="eyebrow">AUDIO GUIDE</text><view class="title">
        戴上耳机，听见西昌
      </view><view class="description">
        播放已发布且音频可用的导览内容。
      </view>
    </view>
    <wd-search v-model="keyword" placeholder="搜索导览标题" hide-cancel maxlength="120" @search="load" @clear="load" />
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
      <view v-for="guide in guides" :key="guide.code" class="guide" role="link" @click="openGuide(guide.code)">
        <view class="play-icon">
          <wd-icon name="play-circle" size="30" />
        </view><view class="guide-copy">
          <view class="guide-title">
            {{ guide.title }}
          </view><view v-if="guide.summary" class="guide-summary">
            {{ guide.summary }}
          </view><view class="guide-target">
            {{ guide.target.name }}
          </view>
        </view><wd-icon name="arrow-right" size="18" color="#69716c" />
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  padding: 28rpx;
  background: #f4f6f3;
  box-sizing: border-box;
}
.intro {
  padding: 28rpx 4rpx 32rpx;
}
.eyebrow {
  color: #34765b;
  font-size: 21rpx;
  font-weight: 600;
}
.title {
  margin-top: 10rpx;
  color: #17211c;
  font-size: 44rpx;
  font-weight: 700;
}
.description {
  margin-top: 12rpx;
  color: #69716c;
  font-size: 26rpx;
}
.state {
  display: flex;
  min-height: 520rpx;
  align-items: center;
  justify-content: center;
}
.guide-list {
  margin-top: 24rpx;
  overflow: hidden;
  background: #fff;
  border: 1px solid #dfe5e0;
  border-radius: 8px;
}
.guide {
  display: flex;
  align-items: center;
  gap: 20rpx;
  min-height: 144rpx;
  padding: 24rpx;
  box-sizing: border-box;
}
.guide + .guide {
  border-top: 1px solid #edf0ed;
}
.play-icon {
  display: flex;
  flex: 0 0 72rpx;
  height: 72rpx;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: #8a4f4a;
  border-radius: 50%;
}
.guide-copy {
  flex: 1;
  min-width: 0;
}
.guide-title {
  color: #17211c;
  font-size: 29rpx;
  font-weight: 600;
}
.guide-summary {
  margin-top: 8rpx;
  color: #69716c;
  font-size: 24rpx;
  line-height: 1.5;
}
.guide-target {
  margin-top: 9rpx;
  color: #34765b;
  font-size: 22rpx;
}
</style>
