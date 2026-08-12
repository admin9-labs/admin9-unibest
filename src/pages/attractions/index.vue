<script lang="ts" setup>
import type { Attraction } from '@/api/attractions'
import { ref } from 'vue'
import { getAttractions } from '@/api/attractions'

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

function openDetail(code: string) {
  uni.navigateTo({ url: `/pages/attractions/detail?code=${encodeURIComponent(code)}` })
}

onLoad(load)
</script>

<template>
  <view class="page">
    <view class="intro">
      <text class="eyebrow">ATTRACTIONS</text>
      <view class="title">
        循着山水，游览西昌
      </view>
      <view class="description">
        浏览当前开放展示的景区信息。
      </view>
    </view>
    <wd-search v-model="keyword" placeholder="搜索景区名称或地址" hide-cancel maxlength="120" @search="load" @clear="load" />

    <view v-if="loading" class="state">
      <wd-loading text="正在加载景区" />
    </view>
    <view v-else-if="failed" class="state">
      <wd-empty icon="network" tip="景区信息暂时无法加载">
        <template #bottom>
          <wd-button size="small" @click="load">
            重新加载
          </wd-button>
        </template>
      </wd-empty>
    </view>
    <view v-else-if="attractions.length === 0" class="state">
      <wd-empty tip="暂无符合条件的景区" />
    </view>
    <view v-else class="item-list">
      <view v-for="attraction in attractions" :key="attraction.code" class="item" role="link" @click="openDetail(attraction.code)">
        <wd-img v-if="attraction.cover?.url" :src="attraction.cover.url" width="100%" height="320rpx" mode="aspectFill" radius="8" lazy-load />
        <view v-else class="cover-placeholder">
          <wd-icon name="picture" size="32" /><text>旅享西昌</text>
        </view>
        <view class="item-body">
          <view class="item-name">
            {{ attraction.name }}
          </view>
          <view v-if="attraction.summary" class="item-summary">
            {{ attraction.summary }}
          </view>
          <view v-if="attraction.address" class="item-meta">
            <wd-icon name="location" size="15" />{{ attraction.address }}
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
.item-list {
  display: grid;
  gap: 24rpx;
  margin-top: 24rpx;
}
.item {
  overflow: hidden;
  background: #fff;
  border: 1px solid #dfe5e0;
  border-radius: 8px;
}
.cover-placeholder {
  display: flex;
  height: 320rpx;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  color: #607068;
  background: #e4ebe6;
  font-size: 23rpx;
}
.item-body {
  padding: 28rpx;
}
.item-name {
  color: #17211c;
  font-size: 34rpx;
  font-weight: 650;
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
  margin-top: 20rpx;
  color: #69716c;
  font-size: 23rpx;
  line-height: 1.5;
}
</style>
