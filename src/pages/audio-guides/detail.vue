<script lang="ts" setup>
import type { AudioGuide } from '@/api/audio-guides'
import type { HttpError } from '@/http/types'
import { ref } from 'vue'
import { getAudioGuide } from '@/api/audio-guides'

defineOptions({ name: 'AudioGuideDetail' })
definePage({ style: { navigationBarTitleText: '导览播放' } })
const code = ref('')
const guide = ref<AudioGuide | null>(null)
const loading = ref(true)
const notFound = ref(false)
const failed = ref(false)
const playing = ref(false)
const playbackFailed = ref(false)
let audio: UniApp.InnerAudioContext | null = null
async function load() {
  if (!code.value) {
    loading.value = false
    notFound.value = true
    return
  }
  loading.value = true
  failed.value = false
  try {
    guide.value = await getAudioGuide(code.value)
    audio = uni.createInnerAudioContext()
    audio.src = guide.value.audio.url
    audio.onPlay(() => {
      playing.value = true
      playbackFailed.value = false
    })
    audio.onPause(() => {
      playing.value = false
    })
    audio.onStop(() => {
      playing.value = false
    })
    audio.onEnded(() => {
      playing.value = false
    })
    audio.onError(() => {
      playing.value = false
      playbackFailed.value = true
    })
  }
  catch (error) {
    notFound.value = (error as HttpError).statusCode === 404
    failed.value = !notFound.value
  }
  finally {
    loading.value = false
  }
}
function togglePlayback() {
  if (!audio)
    return
  if (playing.value)
    audio.pause()
  else
    audio.play()
}
function returnToList() {
  uni.redirectTo({ url: '/pages/audio-guides/index' })
}
function openTarget() {
  if (!guide.value)
    return
  const paths = { attraction: 'attractions', scenic_spot: 'scenic-spots', travel_route: 'travel-routes' }
  uni.navigateTo({ url: `/pages/${paths[guide.value.target_type]}/detail?code=${encodeURIComponent(guide.value.target.code)}` })
}
onLoad((query) => {
  code.value = typeof query?.code === 'string' ? decodeURIComponent(query.code) : ''
  load()
})
onUnload(() => {
  audio?.destroy()
  audio = null
})
</script>

<template>
  <view class="page">
    <view v-if="loading" class="state">
      <wd-loading text="正在加载导览" />
    </view>
    <view v-else-if="notFound" class="state">
      <wd-empty tip="该导览不存在或暂不可播放">
        <template #bottom>
          <wd-button size="small" @click="returnToList">
            返回导览列表
          </wd-button>
        </template>
      </wd-empty>
    </view>
    <view v-else-if="failed" class="state">
      <wd-empty icon="network" tip="导览暂时无法加载">
        <template #bottom>
          <wd-button size="small" @click="load">
            重新加载
          </wd-button>
        </template>
      </wd-empty>
    </view>
    <view v-else-if="guide" class="content">
      <text class="eyebrow">AUDIO GUIDE</text><view class="title">
        {{ guide.title }}
      </view><view v-if="guide.summary" class="summary">
        {{ guide.summary }}
      </view>
      <view class="player">
        <button class="play-button" :aria-label="playing ? '暂停' : '播放'" @click="togglePlayback">
          <wd-icon :name="playing ? 'pause-circle' : 'play-circle'" size="44" />
        </button><view class="player-copy">
          <view>{{ playing ? '正在播放' : '准备播放' }}</view><view v-if="playbackFailed" class="playback-error">
            音频播放失败，请检查网络后重试
          </view>
        </view>
      </view>
      <view class="target" role="link" @click="openTarget">
        <view>
          <text class="target-label">关联内容</text><view class="target-name">
            {{ guide.target.name }}
          </view>
        </view><wd-icon name="arrow-right" size="20" />
      </view>
      <view v-if="guide.script" class="section">
        <view class="section-title">
          讲解文稿
        </view><view class="script">
          {{ guide.script }}
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f4f6f3;
}
.state {
  display: flex;
  min-height: 78vh;
  align-items: center;
  justify-content: center;
  padding: 28rpx;
}
.content {
  padding: 60rpx 28rpx 80rpx;
}
.eyebrow {
  color: #8a4f4a;
  font-size: 22rpx;
  font-weight: 600;
}
.title {
  margin-top: 14rpx;
  color: #17211c;
  font-size: 46rpx;
  font-weight: 700;
  line-height: 1.35;
}
.summary {
  margin-top: 18rpx;
  color: #59635e;
  font-size: 28rpx;
  line-height: 1.7;
}
.player {
  display: flex;
  align-items: center;
  gap: 24rpx;
  margin-top: 40rpx;
  padding: 28rpx;
  color: #fff;
  background: #25302a;
  border-radius: 8px;
}
.play-button {
  display: flex;
  width: 88rpx;
  height: 88rpx;
  align-items: center;
  justify-content: center;
  padding: 0;
  color: #fff;
  background: transparent;
  border: 0;
  border-radius: 50%;
}
.play-button::after {
  border: 0;
}
.player-copy {
  font-size: 28rpx;
}
.playback-error {
  margin-top: 8rpx;
  color: #ffd8d4;
  font-size: 22rpx;
}
.target {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 24rpx;
  padding: 24rpx;
  background: #fff;
  border: 1px solid #dfe5e0;
  border-radius: 8px;
}
.target-label {
  color: #69716c;
  font-size: 22rpx;
}
.target-name {
  margin-top: 6rpx;
  color: #25302a;
  font-size: 28rpx;
  font-weight: 600;
}
.section {
  margin-top: 42rpx;
}
.section-title {
  color: #25302a;
  font-size: 31rpx;
  font-weight: 650;
}
.script {
  margin-top: 18rpx;
  color: #434d48;
  font-size: 28rpx;
  line-height: 1.85;
  white-space: pre-wrap;
}
</style>
