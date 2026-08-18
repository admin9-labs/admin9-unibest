<script lang="ts" setup>
import type { AudioGuide } from '@/api/audio-guides'
import type { HttpError } from '@/http/types'
import { ref } from 'vue'
import { getAudioGuide } from '@/api/audio-guides'
import PublicDetailHeading from '@/components/PublicDetailHeading.vue'

defineOptions({ name: 'AudioGuideDetail' })
definePage({ style: { navigationBarTitleText: '导览播放' } })
const id = ref<number | null>(null)
const guide = ref<AudioGuide | null>(null)
const loading = ref(true)
const notFound = ref(false)
const failed = ref(false)
const playing = ref(false)
const playbackFailed = ref(false)
let audio: UniApp.InnerAudioContext | null = null
async function load() {
  if (id.value === null) {
    loading.value = false
    notFound.value = true
    return
  }
  loading.value = true
  failed.value = false
  try {
    guide.value = await getAudioGuide(id.value)
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
  uni.navigateTo({ url: `/pages/${paths[guide.value.target_type]}/detail?id=${guide.value.target.id}` })
}
onLoad((query) => {
  const parsed = Number(query?.id)
  id.value = Number.isInteger(parsed) && parsed > 0 ? parsed : null
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
      <view class="heading-block">
        <PublicDetailHeading :title="guide.title" :summary="guide.summary" />
      </view>
      <view class="player-stage" :class="{ 'player-stage--playing': playing }">
        <view class="sound-wave" aria-hidden="true">
          <view class="sound-wave__bar sound-wave__bar--1" />
          <view class="sound-wave__bar sound-wave__bar--2" />
          <view class="sound-wave__bar sound-wave__bar--3" />
        </view>
        <button class="play-button" :aria-label="playing ? '暂停' : '播放'" @click="togglePlayback">
          <wd-icon :name="playing ? 'pause-circle' : 'play-circle'" size="34" />
        </button>
        <view class="player-copy">
          <view class="player-status">
            {{ playing ? '正在播放' : '点击播放讲解' }}
          </view>
          <view v-if="playbackFailed" class="playback-error">
            音频播放失败，请检查网络后重试
          </view>
        </view>
      </view>
      <view class="related-section">
        <view class="target" role="link" hover-class="target--pressed" @click="openTarget">
          <view class="target-copy">
            <text class="target-label">关联内容</text>
            <view class="target-name">
              {{ guide.target.name }}
            </view>
          </view>
          <wd-icon name="arrow-right" size="20" />
        </view>
      </view>
      <view v-if="guide.script" class="section">
        <view class="section-heading">
          <text>讲解文稿</text>
        </view>
        <view class="script">
          <text>{{ guide.script }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f7f9f8;
}
.state {
  display: flex;
  min-height: 78vh;
  align-items: center;
  justify-content: center;
  padding: 28rpx;
}
.content {
  width: 100%;
  max-width: 920px;
  margin: 0 auto;
  padding: 48rpx 32rpx calc(80rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}
.heading-block {
  max-width: 780px;
}
.player-stage {
  display: flex;
  min-height: 360rpx;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 40rpx;
  padding: 36rpx 28rpx;
  color: var(--lx-color-primary-strong);
  background: #e6f2f1;
  border-top: 1px solid #cfe2df;
  border-bottom: 1px solid #cfe2df;
  box-sizing: border-box;
}
.sound-wave {
  display: flex;
  height: 24rpx;
  align-items: center;
  gap: 7rpx;
  margin-bottom: 14rpx;
  opacity: 0.45;
}
.sound-wave__bar {
  width: 4rpx;
  background: var(--lx-color-primary);
  border-radius: 8rpx;
}
.sound-wave__bar--1 {
  height: 10rpx;
}
.sound-wave__bar--2 {
  height: 18rpx;
}
.sound-wave__bar--3 {
  height: 12rpx;
}
.player-stage--playing .sound-wave__bar {
  animation: sound-wave 1.2s ease-in-out infinite alternate;
}
.player-stage--playing .sound-wave__bar--2 {
  animation-delay: 120ms;
}
.player-stage--playing .sound-wave__bar--3 {
  animation-delay: 240ms;
}
@keyframes sound-wave {
  from {
    transform: scaleY(0.8);
  }

  to {
    transform: scaleY(1);
  }
}
.play-button {
  display: flex;
  width: 132rpx;
  height: 132rpx;
  align-items: center;
  justify-content: center;
  padding: 0;
  color: #fff;
  background: var(--lx-color-primary-strong);
  border: 0;
  border-radius: 50%;
  box-shadow: 0 12rpx 28rpx rgb(8 102 109 / 20%);
}
.play-button::after {
  border: 0;
}
.player-copy {
  min-width: 0;
  margin-top: 20rpx;
  text-align: center;
}
.player-status {
  font-size: 27rpx;
  font-weight: 600;
}
.playback-error {
  margin-top: 10rpx;
  color: #a33f34;
  font-size: 22rpx;
}
.related-section,
.section {
  margin-top: 48rpx;
}
.section-heading {
  color: var(--lx-color-text-main);
  font-size: 31rpx;
  font-weight: 650;
}
.target {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 0;
  border-top: 1px solid var(--lx-color-border);
  border-bottom: 1px solid var(--lx-color-border);
}
.target-copy {
  min-width: 0;
}
.target--pressed {
  background: var(--lx-color-surface-pressed);
}
.target-label {
  color: var(--lx-color-text-tertiary);
  font-size: 22rpx;
}
.target-name {
  margin-top: 6rpx;
  color: var(--lx-color-text-main);
  font-size: 28rpx;
  font-weight: 600;
  overflow-wrap: anywhere;
}
.script {
  margin-top: 22rpx;
  color: var(--lx-color-text-secondary);
  font-size: 28rpx;
  line-height: 1.85;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
@media (min-width: 760px) {
  .content {
    padding-top: 56px;
    padding-right: 36px;
    padding-left: 36px;
  }

  .player-stage {
    min-height: 300px;
    margin-top: 34px;
  }

  .sound-wave {
    height: 16px;
    gap: 5px;
    margin-bottom: 12px;
  }

  .sound-wave__bar {
    width: 3px;
  }

  .sound-wave__bar--1 {
    height: 7px;
  }

  .sound-wave__bar--2 {
    height: 14px;
  }

  .sound-wave__bar--3 {
    height: 9px;
  }

  .play-button {
    width: 88px;
    height: 88px;
  }

  .player-status {
    font-size: 16px;
  }

  .section-heading {
    font-size: 20px;
  }

  .target-name {
    font-size: 17px;
  }

  .script {
    font-size: 16px;
    line-height: 1.9;
  }
}
@media (max-width: 340px) {
  .content {
    padding-right: 24rpx;
    padding-left: 24rpx;
  }

  .player-stage {
    min-height: 330rpx;
  }
}
</style>
