<script lang="ts" setup>
import type { ScenicSpot } from '@/api/scenic-spots'
import { ref } from 'vue'
import { getScenicSpots } from '@/api/scenic-spots'
import DestinationListItem from '@/components/DestinationListItem.vue'
import PublicState from '@/components/PublicState.vue'

defineOptions({ name: 'ScenicSpotList' })
definePage({ style: { navigationBarTitleText: '西昌景点' } })

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

function openDetail(id: number) {
  uni.navigateTo({ url: `/pages/scenic-spots/detail?id=${id}` })
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
        <wd-search v-model="keyword" placeholder="搜索景点名称或地址" hide-cancel :maxlength="120" @search="load" @clear="clearSearch" />
      </view>

      <PublicState v-if="loading" kind="loading" title="正在加载景点" />
      <PublicState v-else-if="failed" kind="network-error" title="景点信息暂时无法加载" description="请检查网络后重新尝试。" action-text="重新加载" @action="load" />
      <PublicState v-else-if="scenicSpots.length === 0 && keyword.trim()" kind="filtered-empty" title="未找到匹配的景点" description="可以缩短关键词或清除搜索。" action-text="清除搜索" @action="clearSearch" />
      <PublicState v-else-if="scenicSpots.length === 0" kind="initial-empty" title="暂时没有可浏览的景点" />
      <view v-else class="spot-list">
        <DestinationListItem
          v-for="spot in scenicSpots"
          :key="spot.id"
          class="spot"
          :title="spot.name"
          :summary="spot.summary"
          :image-url="spot.cover?.url"
          :address="spot.address"
          @click="openDetail(spot.id)"
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

.spot-list {
  margin-top: 24rpx;
  border-top: 1px solid var(--lx-color-border);
}
</style>
