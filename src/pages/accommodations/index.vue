<script lang="ts" setup>
import type { Accommodation } from '@/api/accommodations'
import { computed, ref } from 'vue'
import { getAccommodations } from '@/api/accommodations'

defineOptions({ name: 'AccommodationList' })
definePage({ style: { navigationBarTitleText: '西昌住宿' } })

const keyword = ref('')
const items = ref<Accommodation[]>([])
const loading = ref(true)
const failed = ref(false)
const selectedCategory = ref('')
const categories = computed(() => Array.from(new Map(items.value.flatMap(item => item.category ? [[item.category.code, item.category] as const] : [])).values()))
const visibleItems = computed(() => selectedCategory.value ? items.value.filter(item => item.category?.code === selectedCategory.value) : items.value)

async function load() {
  loading.value = true
  failed.value = false
  try {
    items.value = await getAccommodations(keyword.value.trim())
    if (selectedCategory.value && !items.value.some(item => item.category?.code === selectedCategory.value))
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
  uni.navigateTo({ url: `/pages/accommodations/detail?code=${encodeURIComponent(code)}` })
}
onLoad(load)
</script>

<template>
  <view class="page">
    <view class="intro">
      <text class="eyebrow">STAY</text>
      <view class="title">
        在西昌，安心住下
      </view>
      <view class="description">
        查看已发布住宿、设施与参考价格。
      </view>
    </view>
    <wd-search v-model="keyword" placeholder="搜索住宿名称或地址" hide-cancel maxlength="120" @search="load" @clear="load" />
    <scroll-view v-if="categories.length" class="categories" scroll-x>
      <view class="category-row">
        <wd-tag v-for="category in categories" :key="category.code" :type="selectedCategory === category.code ? 'primary' : 'default'" :variant="selectedCategory === category.code ? 'dark' : 'plain'" size="large" @click="chooseCategory(category.code)">
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
      <view v-for="item in visibleItems" :key="item.code" class="item" role="link" @click="openDetail(item.code)">
        <wd-img v-if="item.cover?.url" :src="item.cover.url" width="100%" height="300rpx" mode="aspectFill" radius="8" lazy-load />
        <view v-else class="cover-placeholder">
          <wd-icon name="home" size="34" /><text>旅居西昌</text>
        </view>
        <view class="item-body">
          <view class="name-row">
            <view class="item-name">
              {{ item.name }}
            </view><wd-tag v-if="item.category" size="small" type="lightblue" variant="light">
              {{ item.category.name }}
            </wd-tag>
          </view>
          <view v-if="item.summary" class="item-summary">
            {{ item.summary }}
          </view>
          <view v-if="item.address" class="item-meta">
            <wd-icon name="location" size="15" />{{ item.address }}
          </view>
          <view v-if="item.reference_price !== null" class="item-meta price">
            参考价 ¥{{ item.reference_price }} 起
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
  color: #2f6571;
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
.item-list {
  display: grid;
  gap: 24rpx;
  margin-top: 24rpx;
}
.item {
  overflow: hidden;
  background: #fff;
  border: 1px solid #dce4e5;
  border-radius: 8px;
}
.cover-placeholder {
  display: flex;
  height: 300rpx;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  color: #416a73;
  background: #dfe9eb;
  font-size: 23rpx;
}
.item-body {
  padding: 28rpx;
}
.name-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
}
.item-name {
  min-width: 0;
  color: #17211c;
  font-size: 34rpx;
  font-weight: 650;
  overflow-wrap: anywhere;
}
.item-summary {
  display: -webkit-box;
  margin-top: 12rpx;
  overflow: hidden;
  color: #515b56;
  font-size: 26rpx;
  line-height: 1.6;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.item-meta {
  display: flex;
  align-items: flex-start;
  gap: 8rpx;
  margin-top: 18rpx;
  color: #69716c;
  font-size: 23rpx;
  line-height: 1.5;
}
.item-meta.price {
  color: #2f6571;
  font-weight: 600;
}
</style>
