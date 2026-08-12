<script lang="ts" setup>
import type { ScenicSpot } from '@/api/scenic-spots'
import { ref } from 'vue'
import { getScenicSpots } from '@/api/scenic-spots'

defineOptions({ name: 'ScenicSpotList' })
definePage({ style: { navigationBarTitleText: '西昌景区' } })

const keyword = ref('')
const scenicSpots = ref<ScenicSpot[]>([])
const loading = ref(true)
const failed = ref(false)

async function load() {
  loading.value = true
  failed.value = false
  try {
    scenicSpots.value = await getScenicSpots(keyword.value.trim())
  }
  catch {
    failed.value = true
  }
  finally {
    loading.value = false
  }
}

function openDetail(code: string) {
  uni.navigateTo({ url: `/pages/scenic-spots/detail?code=${encodeURIComponent(code)}` })
}

onLoad(load)
</script>

<template>
  <view class="page">
    <view class="intro">
      <text class="eyebrow">SCENIC SPOTS</text>
      <view class="title">
        山水之间，遇见西昌
      </view>
      <view class="description">
        浏览当前开放展示的景区信息。
      </view>
    </view>
    <wd-search v-model="keyword" placeholder="搜索景区名称或地址" hide-cancel maxlength="120" @search="load" @clear="load" />

    <view v-if="loading" class="state">
      <wd-loading text="正在加载景区" />
    </view>
    <view v-else-if="failed" class="state">
      <wd-empty icon="network" tip="景区信息暂时无法加载">
        <template #bottom>
          <wd-button size="small" @click="load">
            重新加载
          </wd-button>
        </template>
      </wd-empty>
    </view>
    <view v-else-if="scenicSpots.length === 0" class="state">
      <wd-empty tip="暂无符合条件的景区" />
    </view>
    <view v-else class="spot-list">
      <view v-for="spot in scenicSpots" :key="spot.code" class="spot" role="link" @click="openDetail(spot.code)">
        <wd-img v-if="spot.cover?.url" :src="spot.cover.url" width="100%" height="320rpx" mode="aspectFill" radius="8" lazy-load />
        <view v-else class="cover-placeholder">
          <wd-icon name="picture" size="32" /><text>旅享西昌</text>
        </view>
        <view class="spot-body">
          <view class="spot-name">
            {{ spot.name }}
          </view>
          <view v-if="spot.summary" class="spot-summary">
            {{ spot.summary }}
          </view>
          <view v-if="spot.address" class="spot-meta">
            <wd-icon name="location" size="15" />{{ spot.address }}
          </view>
        </view>
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
.spot-list {
  display: grid;
  gap: 24rpx;
  margin-top: 24rpx;
}
.spot {
  overflow: hidden;
  background: #fff;
  border: 1px solid #dfe5e0;
  border-radius: 8px;
}
.cover-placeholder {
  display: flex;
  height: 320rpx;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  color: #607068;
  background: #e4ebe6;
  font-size: 23rpx;
}
.spot-body {
  padding: 28rpx;
}
.spot-name {
  color: #17211c;
  font-size: 34rpx;
  font-weight: 650;
}
.spot-summary {
  display: -webkit-box;
  margin-top: 12rpx;
  overflow: hidden;
  color: #515b56;
  font-size: 26rpx;
  line-height: 1.6;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.spot-meta {
  display: flex;
  align-items: flex-start;
  gap: 8rpx;
  margin-top: 20rpx;
  color: #69716c;
  font-size: 23rpx;
  line-height: 1.5;
}
</style>
