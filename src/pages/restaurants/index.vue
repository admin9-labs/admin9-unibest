<script lang="ts" setup>
import type { Restaurant } from '@/api/restaurants'
import { computed, ref } from 'vue'
import { getRestaurants } from '@/api/restaurants'
import PublicContentCard from '@/components/PublicContentCard.vue'

defineOptions({ name: 'RestaurantList' })
definePage({ style: { navigationBarTitleText: '西昌美食' } })

const keyword = ref('')
const restaurants = ref<Restaurant[]>([])
const loading = ref(true)
const failed = ref(false)
const selectedCategoryId = ref<number | null>(null)

const categories = computed(() => {
  const values = restaurants.value.flatMap(item => item.category ? [item.category] : [])
  return Array.from(new Map(values.map(item => [item.id, item])).values())
})
const visibleRestaurants = computed(() => selectedCategoryId.value !== null
  ? restaurants.value.filter(item => item.category?.id === selectedCategoryId.value)
  : restaurants.value)

async function load() {
  loading.value = true
  failed.value = false
  try {
    restaurants.value = await getRestaurants(keyword.value.trim())
    if (selectedCategoryId.value !== null && !restaurants.value.some(item => item.category?.id === selectedCategoryId.value))
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
  uni.navigateTo({ url: `/pages/restaurants/detail?id=${id}` })
}

onLoad(load)
</script>

<template>
  <view class="page">
    <view class="page-content">
      <wd-search v-model="keyword" placeholder="搜索餐厅名称或地址" hide-cancel :maxlength="120" @search="load" @clear="load" />
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
        <wd-loading text="正在加载餐饮信息" />
      </view>
      <view v-else-if="failed" class="state">
        <wd-empty icon="network" tip="餐饮信息暂时无法加载">
          <template #bottom>
            <wd-button size="small" @click="load">
              重新加载
            </wd-button>
          </template>
        </wd-empty>
      </view>
      <view v-else-if="visibleRestaurants.length === 0" class="state">
        <wd-empty tip="暂无符合条件的餐厅" />
      </view>
      <view v-else class="restaurant-list">
        <PublicContentCard
          v-for="restaurant in visibleRestaurants"
          :key="restaurant.id"
          class="restaurant"
          :image-url="restaurant.cover?.url"
          :title="restaurant.name"
          :summary="restaurant.summary"
          @click="openDetail(restaurant.id)"
        >
          <template v-if="restaurant.category" #eyebrow>
            {{ restaurant.category.name }}
          </template>
          <template #meta>
            <view v-if="restaurant.address" class="card-meta">
              <wd-icon name="location" size="15" />
              <text>{{ restaurant.address }}</text>
            </view>
          </template>
          <template v-if="restaurant.average_price !== null" #footer>
            <view class="price">
              人均约 ¥{{ restaurant.average_price }}
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
.restaurant-list {
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
