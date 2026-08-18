<script lang="ts" setup>
import type { Accommodation } from '@/api/accommodations'
import { computed, ref } from 'vue'
import { getAccommodations } from '@/api/accommodations'
import PublicContentCard from '@/components/PublicContentCard.vue'

defineOptions({ name: 'AccommodationList' })
definePage({ style: { navigationBarTitleText: '西昌住宿' } })

const keyword = ref('')
const items = ref<Accommodation[]>([])
const loading = ref(true)
const failed = ref(false)
const selectedCategoryId = ref<number | null>(null)
const categories = computed(() => Array.from(new Map(items.value.flatMap(item => item.category ? [[item.category.id, item.category] as const] : [])).values()))
const visibleItems = computed(() => selectedCategoryId.value !== null ? items.value.filter(item => item.category?.id === selectedCategoryId.value) : items.value)

async function load() {
  loading.value = true
  failed.value = false
  try {
    items.value = await getAccommodations(keyword.value.trim())
    if (selectedCategoryId.value !== null && !items.value.some(item => item.category?.id === selectedCategoryId.value))
      selectedCategoryId.value = null
  }
  catch {
    failed.value = true
  }
  finally {
    loading.value = false
  }
}
function chooseCategory(id: number | null) {
  selectedCategoryId.value = selectedCategoryId.value === id ? null : id
}
function openDetail(id: number) {
  uni.navigateTo({ url: `/pages/accommodations/detail?id=${id}` })
}
onLoad(load)
</script>

<template>
  <view class="page">
    <view class="page-content">
      <wd-search v-model="keyword" placeholder="搜索住宿名称或地址" hide-cancel :maxlength="120" @search="load" @clear="load" />
      <scroll-view v-if="categories.length" class="categories" scroll-x>
        <view class="category-row">
          <wd-tag
            class="filter-tag"
            :type="selectedCategoryId === null ? 'primary' : 'default'"
            :variant="selectedCategoryId === null ? 'dark' : 'plain'"
            size="large"
            @click="chooseCategory(null)"
          >
            全部
          </wd-tag>
          <wd-tag
            v-for="category in categories"
            :key="category.id"
            class="filter-tag"
            :type="selectedCategoryId === category.id ? 'primary' : 'default'"
            :variant="selectedCategoryId === category.id ? 'dark' : 'plain'"
            size="large"
            @click="chooseCategory(category.id)"
          >
            {{ category.name }}
          </wd-tag>
        </view>
      </scroll-view>
      <view v-if="loading" class="state">
        <wd-loading text="正在加载住宿信息" />
      </view>
      <view v-else-if="failed" class="state">
        <wd-empty icon="network" tip="住宿信息暂时无法加载">
          <template #bottom>
            <wd-button size="small" @click="load">
              重新加载
            </wd-button>
          </template>
        </wd-empty>
      </view>
      <view v-else-if="visibleItems.length === 0" class="state">
        <wd-empty tip="暂无符合条件的住宿" />
      </view>
      <view v-else class="item-list">
        <PublicContentCard
          v-for="item in visibleItems"
          :key="item.id"
          class="item"
          :image-url="item.cover?.url"
          :title="item.name"
          :summary="item.summary"
          @click="openDetail(item.id)"
        >
          <template v-if="item.category" #eyebrow>
            {{ item.category.name }}
          </template>
          <template #meta>
            <view v-if="item.address" class="card-meta">
              <wd-icon name="location" size="15" />
              <text>{{ item.address }}</text>
            </view>
          </template>
          <template v-if="item.reference_price !== null" #footer>
            <view class="price">
              参考价 ¥{{ item.reference_price }} 起
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

.categories {
  width: 100%;
  margin-top: 16rpx;
  white-space: nowrap;
}

.category-row {
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
.item-list {
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

.price {
  color: var(--lx-color-accent);
  font-weight: 600;
}
</style>
