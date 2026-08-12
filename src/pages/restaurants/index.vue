<script lang="ts" setup>
import type { Restaurant } from '@/api/restaurants'
import { computed, ref } from 'vue'
import { getRestaurants } from '@/api/restaurants'

defineOptions({ name: 'RestaurantList' })
definePage({ style: { navigationBarTitleText: '西昌美食' } })

const keyword = ref('')
const restaurants = ref<Restaurant[]>([])
const loading = ref(true)
const failed = ref(false)
const selectedCategory = ref('')

const categories = computed(() => {
  const values = restaurants.value.flatMap(item => item.category ? [item.category] : [])
  return Array.from(new Map(values.map(item => [item.code, item])).values())
})
const visibleRestaurants = computed(() => selectedCategory.value
  ? restaurants.value.filter(item => item.category?.code === selectedCategory.value)
  : restaurants.value)

async function load() {
  loading.value = true
  failed.value = false
  try {
    restaurants.value = await getRestaurants(keyword.value.trim())
    if (selectedCategory.value && !restaurants.value.some(item => item.category?.code === selectedCategory.value))
      selectedCategory.value = ''
  }
  catch {
    failed.value = true
  }
  finally {
    loading.value = false
  }
}

function chooseCategory(code: string) {
  selectedCategory.value = selectedCategory.value === code ? '' : code
}

function openDetail(code: string) {
  uni.navigateTo({ url: `/pages/restaurants/detail?code=${encodeURIComponent(code)}` })
}

onLoad(load)
</script>

<template>
  <view class="page">
    <view class="intro">
      <text class="eyebrow">DINING</text>
      <view class="title">
        尝一口西昌风味
      </view>
      <view class="description">
        浏览已发布餐饮信息与招牌菜。
      </view>
    </view>
    <wd-search v-model="keyword" placeholder="搜索餐厅名称或地址" hide-cancel maxlength="120" @search="load" @clear="load" />
    <scroll-view v-if="categories.length" class="categories" scroll-x>
      <view class="category-row">
        <wd-tag
          v-for="category in categories"
          :key="category.code"
          :type="selectedCategory === category.code ? 'primary' : 'default'"
          :variant="selectedCategory === category.code ? 'dark' : 'plain'"
          size="large"
          @click="chooseCategory(category.code)"
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
      <view v-for="restaurant in visibleRestaurants" :key="restaurant.code" class="restaurant" role="link" @click="openDetail(restaurant.code)">
        <wd-img v-if="restaurant.cover?.url" :src="restaurant.cover.url" width="100%" height="300rpx" mode="aspectFill" radius="8" lazy-load />
        <view v-else class="cover-placeholder">
          <wd-icon name="food" size="34" /><text>西昌味道</text>
        </view>
        <view class="restaurant-body">
          <view class="name-row">
            <view class="restaurant-name">
              {{ restaurant.name }}
            </view>
            <wd-tag v-if="restaurant.category" size="small" type="success" variant="light">
              {{ restaurant.category.name }}
            </wd-tag>
          </view>
          <view v-if="restaurant.summary" class="restaurant-summary">
            {{ restaurant.summary }}
          </view>
          <view v-if="restaurant.address" class="restaurant-meta">
            <wd-icon name="location" size="15" />{{ restaurant.address }}
          </view>
          <view v-if="restaurant.average_price !== null" class="restaurant-meta price">
            人均约 ¥{{ restaurant.average_price }}
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
  color: #a64532;
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
.categories {
  width: 100%;
  margin-top: 20rpx;
  white-space: nowrap;
}
.category-row {
  display: inline-flex;
  gap: 16rpx;
  padding: 2rpx;
}
.state {
  display: flex;
  min-height: 520rpx;
  align-items: center;
  justify-content: center;
}
.restaurant-list {
  display: grid;
  gap: 24rpx;
  margin-top: 24rpx;
}
.restaurant {
  overflow: hidden;
  background: #fff;
  border: 1px solid #e5dedb;
  border-radius: 8px;
}
.cover-placeholder {
  display: flex;
  height: 300rpx;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  color: #7b4f43;
  background: #eee4df;
  font-size: 23rpx;
}
.restaurant-body {
  padding: 28rpx;
}
.name-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
}
.restaurant-name {
  min-width: 0;
  color: #17211c;
  font-size: 34rpx;
  font-weight: 650;
  overflow-wrap: anywhere;
}
.restaurant-summary {
  display: -webkit-box;
  margin-top: 12rpx;
  overflow: hidden;
  color: #515b56;
  font-size: 26rpx;
  line-height: 1.6;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.restaurant-meta {
  display: flex;
  align-items: flex-start;
  gap: 8rpx;
  margin-top: 18rpx;
  color: #69716c;
  font-size: 23rpx;
  line-height: 1.5;
}
.restaurant-meta.price {
  color: #a64532;
  font-weight: 600;
}
</style>
