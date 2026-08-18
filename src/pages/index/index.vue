<script lang="ts" setup>
interface HomeEntry {
  title: string
  icon: string
  url: string
}

interface JourneyStage {
  title: string
  entries: HomeEntry[]
}

defineOptions({ name: 'Home' })
definePage({ type: 'home', style: { navigationBarTitleText: '旅享西昌' } })

const journeyStages: JourneyStage[] = [
  {
    title: '发现目的地',
    entries: [
      { title: '景区', icon: 'location', url: '/pages/attractions/index' },
      { title: '景点', icon: 'eye', url: '/pages/scenic-spots/index' },
      { title: '攻略资讯', icon: 'book', url: '/pages/articles/index' },
    ],
  },
  {
    title: '规划到访',
    entries: [
      { title: '线路', icon: 'compass', url: '/pages/travel-routes/index' },
      { title: '语音导览', icon: 'headset', url: '/pages/audio-guides/index' },
      { title: '餐饮', icon: 'store', url: '/pages/restaurants/index' },
      { title: '住宿', icon: 'home', url: '/pages/accommodations/index' },
    ],
  },
  {
    title: '在途服务',
    entries: [
      { title: '地图导览', icon: 'locate', url: '/pages/map/index' },
      { title: '旅游服务', icon: 'phone', url: '/pages/public-services/index' },
      { title: 'AI 文旅助手', icon: 'robot', url: '/pages/ai-assistants/index' },
    ],
  },
]

function open(url: string) {
  uni.navigateTo({ url })
}
</script>

<template>
  <view class="home-page">
    <view class="home-shell">
      <view class="home-hero">
        <wd-img
          src="/static/images/home-qionghai-sunrise.jpg"
          width="100%"
          height="100%"
          mode="aspectFill"
          radius="0"
          :show-loading="true"
          :show-error="true"
        >
          <template #loading>
            <view class="hero-fallback">
              <wd-loading color="#ffffff" />
            </view>
          </template>
          <template #error>
            <view class="hero-fallback">
              <wd-icon name="image" size="30" />
            </view>
          </template>
        </wd-img>
        <view class="hero-shade" />
        <view class="hero-copy">
          <view class="hero-location">
            <wd-icon name="location" size="16" />
            <text>四川 · 西昌</text>
          </view>
        </view>
      </view>
      <view class="home-content">
        <view v-for="(stage, stageIndex) in journeyStages" :key="stage.title" class="journey-stage" :class="`journey-stage--${stageIndex + 1}`">
          <view class="stage-heading">
            <text class="stage-index">0{{ stageIndex + 1 }}</text>
            <view class="stage-title">
              {{ stage.title }}
            </view>
          </view>
          <view class="stage-entries">
            <view v-for="entry in stage.entries" :key="entry.url" class="home-entry" role="link" hover-class="home-entry--pressed" @click="open(entry.url)">
              <wd-icon class="entry-icon" :name="entry.icon" :size="stageIndex === 1 ? 23 : 21" />
              <view class="entry-title">
                {{ entry.title }}
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.home-page {
  min-height: 100vh;
  background: var(--lx-color-surface-muted);
}

.home-shell {
  width: 100%;
  max-width: 1180px;
  min-height: 100vh;
  margin: 0 auto;
  background: var(--lx-color-surface-muted);
}

.home-hero {
  position: relative;
  aspect-ratio: 16 / 9;
  max-height: 520rpx;
  overflow: hidden;
  background: #dfe7e5;
}

.hero-fallback {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: var(--lx-color-primary-strong);
}

.hero-copy {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1;
  padding: 28rpx 32rpx;
  color: #fff;
  box-sizing: border-box;
}

.hero-shade {
  position: absolute;
  inset: 0;
  background: rgb(8 28 31 / 18%);
}

.hero-location {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 23rpx;
  font-weight: 600;
  line-height: 1.4;
  text-shadow: 0 1px 3px rgb(0 0 0 / 34%);
}

.home-content {
  padding: 38rpx 28rpx calc(56rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.journey-stage + .journey-stage {
  margin-top: 48rpx;
}

.stage-heading {
  display: flex;
  align-items: baseline;
  gap: 14rpx;
  margin-bottom: 22rpx;
}

.stage-index {
  color: var(--lx-color-primary);
  font-size: 20rpx;
  font-weight: 700;
}

.stage-title {
  color: var(--lx-color-text-main);
  font-size: 32rpx;
  font-weight: 680;
  line-height: 1.3;
}

.stage-entries {
  display: grid;
  min-width: 0;
}

.journey-stage--1 .stage-entries,
.journey-stage--3 .stage-entries {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.journey-stage--2 .stage-entries {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  border-top: 1px solid var(--lx-color-border);
  border-bottom: 1px solid var(--lx-color-border);
}

.journey-stage--3 {
  margin-right: -28rpx;
  margin-left: -28rpx;
  padding: 30rpx 28rpx 34rpx;
  background: var(--lx-color-surface-lake);
}

.home-entry {
  display: flex;
  min-width: 0;
  min-height: 116rpx;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 16rpx;
  padding: 18rpx;
  box-sizing: border-box;
  transition: opacity 120ms ease;
}

.home-entry--pressed {
  opacity: 0.56;
}

.entry-icon {
  color: var(--lx-color-primary);
}

.entry-title {
  color: var(--lx-color-text-main);
  font-size: 26rpx;
  font-weight: 620;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.journey-stage--2 .home-entry {
  min-height: 130rpx;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 15rpx;
  border-bottom: 1px solid var(--lx-color-border);
}

.journey-stage--2 .home-entry:nth-child(odd) {
  border-right: 1px solid var(--lx-color-border);
}
.journey-stage--2 .home-entry:nth-last-child(-n + 2) {
  border-bottom: 0;
}
.journey-stage--2 .entry-title {
  font-size: 28rpx;
}
.journey-stage--3 .entry-icon {
  color: var(--lx-color-secondary);
}
.journey-stage--3 .home-entry {
  padding-top: 10rpx;
  padding-bottom: 10rpx;
}

.journey-stage--1 .home-entry + .home-entry,
.journey-stage--3 .home-entry + .home-entry {
  border-left: 1px solid var(--lx-color-border);
}

@media (min-width: 760px) {
  .home-page {
    padding: 24px;
    box-sizing: border-box;
  }

  .home-shell {
    min-height: auto;
  }

  .home-hero {
    height: 360px;
    max-height: none;
    aspect-ratio: auto;
    border-radius: 8px;
  }

  .hero-copy {
    padding: 32px 36px;
  }

  .home-content {
    padding: 38px 0 56px;
  }

  .journey-stage--2 .stage-entries {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .journey-stage--2 .home-entry {
    border-right: 1px solid var(--lx-color-border);
    border-bottom: 0;
  }

  .journey-stage--2 .home-entry:last-child {
    border-right: 0;
  }
}

@media (max-width: 340px) {
  .home-content {
    padding-right: 20rpx;
    padding-left: 20rpx;
  }

  .journey-stage--3 {
    margin-right: -20rpx;
    margin-left: -20rpx;
    padding-right: 20rpx;
    padding-left: 20rpx;
  }

  .home-entry {
    padding: 14rpx 10rpx;
  }

  .entry-title {
    font-size: 24rpx;
  }
}
</style>
