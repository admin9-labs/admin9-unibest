<script lang="ts" setup>
import type { ParkingFacility } from '@/api/parking-facilities'
import type { ParkingFacilityResource } from '@/service/types'
import { computed, ref } from 'vue'
import { getParkingFacilities } from '@/api/parking-facilities'

defineOptions({ name: 'ParkingFacilityList' })
definePage({ style: { navigationBarTitleText: '停车设施' } })

const keyword = ref('')
const type = ref<ParkingFacilityResource['type'] | undefined>()
const records = ref<ParkingFacility[]>([])
const loading = ref(true)
const loadingMore = ref(false)
const failed = ref(false)
const page = ref(1)
const hasMore = ref(false)
let requestGeneration = 0
const types: Array<{ label: string, value?: ParkingFacilityResource['type'] }> = [
  { label: '全部' },
  { label: '停车场', value: 'parking_lot' },
  { label: '停车点', value: 'parking_point' },
]
const visible = computed(() => type.value ? records.value.filter(item => item.type === type.value) : records.value)

async function load(reset = true) {
  if (reset) {
    loading.value = true
    failed.value = false
  }
  else {
    if (loadingMore.value || !hasMore.value)
      return
    loadingMore.value = true
  }
  const generation = ++requestGeneration
  const requestKeyword = keyword.value.trim()
  const requestType = type.value
  const targetPage = reset ? 1 : page.value + 1
  try {
    const result = await getParkingFacilities(requestKeyword, requestType, targetPage)
    if (generation !== requestGeneration)
      return
    records.value = reset ? result.records : [...records.value, ...result.records]
    page.value = result.meta.page
    hasMore.value = result.meta.has_more
  }
  catch {
    if (generation !== requestGeneration)
      return
    if (reset)
      failed.value = true
    else
      uni.showToast({ title: '下一页加载失败', icon: 'none' })
  }
  finally {
    if (generation === requestGeneration) {
      loading.value = false
      loadingMore.value = false
    }
  }
}

function reload() {
  return load(true)
}

function chooseType(value?: ParkingFacilityResource['type']) {
  type.value = value
  reload()
}

function openDetail(id: number) {
  uni.navigateTo({ url: `/pages/parking-facilities/detail?id=${id}` })
}

onLoad(reload)
</script>

<template>
  <view class="page">
    <view class="page-content">
      <wd-search v-model="keyword" placeholder="搜索停车场或停车点" hide-cancel :maxlength="120" @search="reload" @clear="reload" />
      <scroll-view class="types" scroll-x>
        <view class="type-row">
          <wd-tag v-for="item in types" :key="item.value || 'all'" class="type-tag" :type="type === item.value ? 'primary' : 'default'" :variant="type === item.value ? 'dark' : 'plain'" size="large" @click="chooseType(item.value)">
            {{ item.label }}
          </wd-tag>
        </view>
      </scroll-view>
      <view v-if="loading" class="state">
        <wd-loading text="正在加载停车设施" />
      </view>
      <view v-else-if="failed" class="state">
        <wd-empty icon="network" tip="停车设施暂时无法加载">
          <template #bottom>
            <wd-button size="small" @click="reload">
              重新加载
            </wd-button>
          </template>
        </wd-empty>
      </view>
      <view v-else-if="!visible.length" class="state">
        <wd-empty tip="暂无已发布停车设施" />
      </view>
      <view v-else class="list">
        <view v-for="item in visible" :key="item.id" class="item" role="link" @click="openDetail(item.id)">
          <view class="item-copy">
            <view class="eyebrow">
              {{ item.type === 'parking_lot' ? '停车场' : '停车点' }}
            </view><view class="name">
              {{ item.name }}
            </view><view class="summary">
              {{ item.summary || item.address || '具体信息以现场公示为准' }}
            </view><view class="meta">
              <text v-if="item.total_spaces !== null">总车位 {{ item.total_spaces }}</text><text v-if="item.opening_hours">{{ item.opening_hours }}</text>
            </view>
          </view><wd-icon name="arrow-right" size="20" />
        </view>
        <view v-if="hasMore" class="load-more">
          <wd-button size="small" plain :loading="loadingMore" @click="load(false)">
            加载更多
          </wd-button>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: var(--lx-color-surface-muted);
}
.page-content {
  width: 100%;
  max-width: var(--lx-page-max);
  margin: 0 auto;
  padding: 24rpx var(--lx-space-page) calc(64rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}
.types {
  margin: 18rpx 0;
  white-space: nowrap;
}
.type-row {
  display: inline-flex;
  gap: 12rpx;
}
.state {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
.list {
  border-top: 1px solid var(--lx-color-border-strong);
}
.item {
  display: flex;
  min-height: 150rpx;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
  padding: 24rpx 0;
  border-bottom: 1px solid var(--lx-color-border);
}
.item-copy {
  min-width: 0;
  flex: 1;
}
.eyebrow {
  color: var(--lx-color-primary-strong);
  font-size: 21rpx;
}
.name {
  margin-top: 6rpx;
  color: var(--lx-color-text-main);
  font-size: 30rpx;
  font-weight: 650;
}
.summary {
  margin-top: 8rpx;
  color: var(--lx-color-text-secondary);
  font-size: 24rpx;
  line-height: 1.5;
}
.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 10rpx;
  color: var(--lx-color-text-tertiary);
  font-size: 22rpx;
}
.load-more {
  display: flex;
  justify-content: center;
  padding: 28rpx 0 8rpx;
}
</style>
