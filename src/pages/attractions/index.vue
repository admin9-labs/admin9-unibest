<script lang="ts" setup>
import type { Attraction } from '@/api/attractions'
import { ref } from 'vue'
import { getAttractions } from '@/api/attractions'
import DestinationListItem from '@/components/DestinationListItem.vue'
import PublicState from '@/components/PublicState.vue'

defineOptions({ name: 'AttractionList' })
definePage({ style: { navigationBarTitleText: '西昌景区' } })

const keyword = ref('')
const attractions = ref<Attraction[]>([])
const loading = ref(true)
const failed = ref(false)

async function load() {
  loading.value = true
  failed.value = false
  try {
    attractions.value = await getAttractions(keyword.value.trim())
  }
  catch {
    failed.value = true
  }
  finally {
    loading.value = false
  }
}

function openDetail(id: number) {
  uni.navigateTo({ url: `/pages/attractions/detail?id=${id}` })
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
        <wd-search v-model="keyword" placeholder="搜索景区名称或地址" hide-cancel :maxlength="120" @search="load" @clear="clearSearch" />
      </view>

      <PublicState v-if="loading" kind="loading" title="正在加载景区" />
      <PublicState v-else-if="failed" kind="network-error" title="景区信息暂时无法加载" description="请检查网络后重新尝试。" action-text="重新加载" @action="load" />
      <PublicState v-else-if="attractions.length === 0 && keyword.trim()" kind="filtered-empty" title="未找到匹配的景区" description="可以缩短关键词或清除搜索。" action-text="清除搜索" @action="clearSearch" />
      <PublicState v-else-if="attractions.length === 0" kind="initial-empty" title="暂时没有可浏览的景区" />
      <view v-else class="item-list">
        <DestinationListItem
          v-for="attraction in attractions"
          :key="attraction.id"
          class="item"
          :title="attraction.name"
          :summary="attraction.summary"
          :image-url="attraction.cover?.url"
          :address="attraction.address"
          @click="openDetail(attraction.id)"
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

.item-list {
  margin-top: 24rpx;
  border-top: 1px solid var(--lx-color-border);
}
</style>
