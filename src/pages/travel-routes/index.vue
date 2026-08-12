<script lang="ts" setup>
import type { TravelRoute } from '@/api/travel-routes'
import { ref } from 'vue'
import { getTravelRoutes } from '@/api/travel-routes'

defineOptions({ name: 'TravelRouteList' })
definePage({ style: { navigationBarTitleText: '西昌线路' } })

const keyword = ref('')
const routes = ref<TravelRoute[]>([])
const loading = ref(true)
const failed = ref(false)

function durationLabel(minutes: number | null) {
  if (!minutes)
    return ''
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return `${hours ? `${hours}小时` : ''}${rest ? `${rest}分钟` : ''}`
}

async function load() {
  loading.value = true
  failed.value = false
  try {
    routes.value = await getTravelRoutes(keyword.value.trim())
  }
  catch {
    failed.value = true
  }
  finally {
    loading.value = false
  }
}

function openDetail(code: string) {
  uni.navigateTo({ url: `/pages/travel-routes/detail?code=${encodeURIComponent(code)}` })
}

onLoad(load)
</script>

<template>
  <view class="page">
    <view class="intro">
      <text class="eyebrow">ROUTES</text>
      <view class="title">
        沿着线路，慢游西昌
      </view>
      <view class="description">
        从已发布线路中选择适合此刻的行程。
      </view>
    </view>
    <wd-search v-model="keyword" placeholder="搜索线路名称" hide-cancel maxlength="120" @search="load" @clear="load" />
    <view v-if="loading" class="state">
      <wd-loading text="正在加载线路" />
    </view>
    <view v-else-if="failed" class="state">
      <wd-empty icon="network" tip="线路暂时无法加载">
        <template #bottom>
          <wd-button size="small" @click="load">
            重新加载
          </wd-button>
        </template>
      </wd-empty>
    </view>
    <view v-else-if="routes.length === 0" class="state">
      <wd-empty tip="暂无符合条件的线路" />
    </view>
    <view v-else class="route-list">
      <view v-for="route in routes" :key="route.code" class="route" role="link" @click="openDetail(route.code)">
        <wd-img v-if="route.cover?.url" :src="route.cover.url" width="100%" height="300rpx" mode="aspectFill" radius="8" lazy-load />
        <view v-else class="cover-placeholder">
          <wd-icon name="road" size="34" /><text>旅享西昌</text>
        </view>
        <view class="route-body">
          <view class="route-name">
            {{ route.name }}
          </view><view v-if="route.summary" class="route-summary">
            {{ route.summary }}
          </view><view v-if="durationLabel(route.duration_minutes)" class="duration">
            <wd-icon name="time" size="15" />{{ durationLabel(route.duration_minutes) }}
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
.route-list {
  display: grid;
  gap: 24rpx;
  margin-top: 24rpx;
}
.route {
  overflow: hidden;
  background: #fff;
  border: 1px solid #dfe5e0;
  border-radius: 8px;
}
.cover-placeholder {
  display: flex;
  height: 300rpx;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  color: #496270;
  background: #e3eaed;
  font-size: 23rpx;
}
.route-body {
  padding: 28rpx;
}
.route-name {
  color: #17211c;
  font-size: 34rpx;
  font-weight: 650;
}
.route-summary {
  margin-top: 12rpx;
  color: #515b56;
  font-size: 26rpx;
  line-height: 1.6;
}
.duration {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-top: 20rpx;
  color: #365f75;
  font-size: 24rpx;
}
</style>
