<script lang="ts" setup>
import type { ServiceInformation } from '@/api/service-information'
import { computed, ref } from 'vue'
import { getServiceInformation } from '@/api/service-information'
import PublicContentCard from '@/components/PublicContentCard.vue'

defineOptions({ name: 'ServiceInformationList' })
definePage({ style: { navigationBarTitleText: '旅游服务' } })

const keyword = ref('')
const items = ref<ServiceInformation[]>([])
const loading = ref(true)
const failed = ref(false)
const selectedTypeId = ref<number | null>(null)
const types = computed(() => Array.from(new Map(items.value.flatMap(item => item.type ? [[item.type.id, item.type] as const] : [])).values()))
const visibleItems = computed(() => selectedTypeId.value !== null ? items.value.filter(item => item.type?.id === selectedTypeId.value) : items.value)

async function load() {
  loading.value = true
  failed.value = false
  try {
    items.value = await getServiceInformation(keyword.value.trim())
    if (selectedTypeId.value !== null && !items.value.some(item => item.type?.id === selectedTypeId.value))
      selectedTypeId.value = null
  }
  catch {
    failed.value = true
  }
  finally {
    loading.value = false
  }
}
function chooseType(id: number | null) {
  selectedTypeId.value = selectedTypeId.value === id ? null : id
}
function openDetail(id: number) {
  uni.navigateTo({ url: `/pages/services/detail?id=${id}` })
}
onLoad(load)
</script>

<template>
  <view class="page">
    <view class="page-content">
      <wd-search v-model="keyword" placeholder="搜索服务名称、区域或地址" hide-cancel :maxlength="120" @search="load" @clear="load" />
      <scroll-view v-if="types.length" class="types" scroll-x>
        <view class="type-row">
          <wd-tag
            class="filter-tag"
            :type="selectedTypeId === null ? 'primary' : 'default'"
            :variant="selectedTypeId === null ? 'dark' : 'plain'"
            size="large"
            @click="chooseType(null)"
          >
            全部
          </wd-tag>
          <wd-tag
            v-for="type in types"
            :key="type.id"
            class="filter-tag"
            :type="selectedTypeId === type.id ? 'primary' : 'default'"
            :variant="selectedTypeId === type.id ? 'dark' : 'plain'"
            size="large"
            @click="chooseType(type.id)"
          >
            {{ type.name }}
          </wd-tag>
        </view>
      </scroll-view>
      <view v-if="loading" class="state">
        <wd-loading text="正在加载服务信息" />
      </view>
      <view v-else-if="failed" class="state">
        <wd-empty icon="network" tip="服务信息暂时无法加载">
          <template #bottom>
            <wd-button size="small" @click="load">
              重新加载
            </wd-button>
          </template>
        </wd-empty>
      </view>
      <view v-else-if="visibleItems.length === 0" class="state">
        <wd-empty tip="暂无符合条件的服务信息" />
      </view>
      <view v-else class="service-list">
        <PublicContentCard
          v-for="item in visibleItems"
          :key="item.id"
          class="service"
          :image-url="item.cover?.url"
          :title="item.title"
          :summary="item.summary"
          @click="openDetail(item.id)"
        >
          <template v-if="item.type" #eyebrow>
            {{ item.type.name }}
          </template>
          <template #meta>
            <view v-if="item.service_area" class="card-meta">
              <wd-icon name="location" size="15" />
              <text>{{ item.service_area }}</text>
            </view>
          </template>
        </PublicContentCard>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  padding: 20rpx 24rpx calc(40rpx + env(safe-area-inset-bottom));
  background: var(--lx-color-surface-muted);
  box-sizing: border-box;
}

.page-content {
  width: 100%;
  max-width: 960rpx;
  margin: 0 auto;
}

.types {
  width: 100%;
  margin-top: 16rpx;
  white-space: nowrap;
}

.type-row {
  display: inline-flex;
  gap: 12rpx;
  padding: 2rpx 4rpx 6rpx;
}

.state {
  display: flex;
  min-height: 520rpx;
  align-items: center;
  justify-content: center;
}
.service-list {
  display: grid;
  gap: 18rpx;
  margin-top: 24rpx;
}

.card-meta {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  gap: 8rpx;
}

.card-meta text {
  min-width: 0;
  overflow-wrap: anywhere;
}
</style>
