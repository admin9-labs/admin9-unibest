<script lang="ts" setup>
import type { TravelRoute } from '@/api/travel-routes'
import { ref } from 'vue'
import { getTravelRoutes } from '@/api/travel-routes'
import PublicState from '@/components/PublicState.vue'
import TravelRouteItem from '@/components/TravelRouteItem.vue'

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

function openDetail(id: number) {
  uni.navigateTo({ url: `/pages/travel-routes/detail?id=${id}` })
}

function clearSearch() {
  keyword.value = ''
  load()
}

onLoad(load)
</script>

<template>
  <view class="page">
    <view class="page-shell">
      <view class="search-wrap">
        <wd-search v-model="keyword" placeholder="搜索线路名称" hide-cancel :maxlength="120" @search="load" @clear="clearSearch" />
      </view>
      <PublicState v-if="loading" kind="loading" title="正在加载线路" />
      <PublicState v-else-if="failed" kind="network-error" title="线路暂时无法加载" description="请检查网络后重新尝试。" action-text="重新加载" @action="load" />
      <PublicState v-else-if="routes.length === 0 && keyword.trim()" kind="filtered-empty" title="未找到匹配的线路" description="可以缩短关键词或清除搜索。" action-text="清除搜索" @action="clearSearch" />
      <PublicState v-else-if="routes.length === 0" kind="initial-empty" title="暂时没有可浏览的线路" />
      <view v-else class="route-list">
        <TravelRouteItem
          v-for="route in routes"
          :key="route.id"
          class="route"
          :title="route.name"
          :summary="route.summary"
          :image-url="route.cover?.url"
          :duration="durationLabel(route.duration_minutes) ? `建议用时 ${durationLabel(route.duration_minutes)}` : ''"
          @click="openDetail(route.id)"
        />
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: var(--lx-color-surface-muted);
}

.page-shell {
  width: 100%;
  max-width: var(--lx-page-max);
  min-height: 100vh;
  margin: 0 auto;
  padding: 20rpx var(--lx-space-page) calc(40rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.search-wrap {
  overflow: hidden;
  border: 1px solid var(--lx-color-border);
  border-radius: var(--lx-radius-card);
}

.route-list {
  display: grid;
  gap: 28rpx;
  margin-top: 24rpx;
}

@media (min-width: 760px) {
  .route-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 32px 28px;
  }
}
</style>
