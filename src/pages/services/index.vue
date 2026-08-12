<script lang="ts" setup>
import type { ServiceInformation } from '@/api/service-information'
import { computed, ref } from 'vue'
import { getServiceInformation } from '@/api/service-information'

defineOptions({ name: 'ServiceInformationList' })
definePage({ style: { navigationBarTitleText: '旅游服务' } })

const keyword = ref('')
const items = ref<ServiceInformation[]>([])
const loading = ref(true)
const failed = ref(false)
const selectedType = ref('')
const types = computed(() => Array.from(new Map(items.value.flatMap(item => item.type ? [[item.type.code, item.type] as const] : [])).values()))
const visibleItems = computed(() => selectedType.value ? items.value.filter(item => item.type?.code === selectedType.value) : items.value)

async function load() {
  loading.value = true
  failed.value = false
  try {
    items.value = await getServiceInformation(keyword.value.trim())
    if (selectedType.value && !items.value.some(item => item.type?.code === selectedType.value))
      selectedType.value = ''
  }
  catch {
    failed.value = true
  }
  finally {
    loading.value = false
  }
}
function chooseType(code: string) {
  selectedType.value = selectedType.value === code ? '' : code
}
function openDetail(code: string) {
  uni.navigateTo({ url: `/pages/services/detail?code=${encodeURIComponent(code)}` })
}
onLoad(load)
</script>

<template>
  <view class="page">
    <view class="intro">
      <text class="eyebrow">TRAVEL SERVICES</text>
      <view class="title">
        在西昌，找到需要的服务
      </view>
      <view class="description">
        浏览已发布的游客中心、交通与便民信息。
      </view>
    </view>
    <wd-search v-model="keyword" placeholder="搜索服务名称、区域或地址" hide-cancel maxlength="120" @search="load" @clear="load" />
    <scroll-view v-if="types.length" class="types" scroll-x>
      <view class="type-row">
        <wd-tag v-for="type in types" :key="type.code" :type="selectedType === type.code ? 'primary' : 'default'" :variant="selectedType === type.code ? 'dark' : 'plain'" size="large" @click="chooseType(type.code)">
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
      <view v-for="item in visibleItems" :key="item.code" class="service" role="link" @click="openDetail(item.code)">
        <wd-img v-if="item.cover?.url" :src="item.cover.url" width="100%" height="280rpx" mode="aspectFill" radius="8" lazy-load />
        <view v-else class="cover-placeholder">
          <wd-icon name="service" size="34" /><text>游客服务</text>
        </view>
        <view class="service-body">
          <view class="name-row">
            <view class="service-name">
              {{ item.title }}
            </view><wd-tag v-if="item.type" size="small" type="success" variant="light">
              {{ item.type.name }}
            </wd-tag>
          </view>
          <view v-if="item.summary" class="service-summary">
            {{ item.summary }}
          </view>
          <view v-if="item.service_area" class="service-meta">
            <wd-icon name="location" size="15" />{{ item.service_area }}
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
  color: #246b61;
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
.types {
  width: 100%;
  margin-top: 20rpx;
  white-space: nowrap;
}
.type-row {
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
.service-list {
  display: grid;
  gap: 24rpx;
  margin-top: 24rpx;
}
.service {
  overflow: hidden;
  background: #fff;
  border: 1px solid #dbe4df;
  border-radius: 8px;
}
.cover-placeholder {
  display: flex;
  height: 280rpx;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  color: #246b61;
  background: #e1ece8;
  font-size: 23rpx;
}
.service-body {
  padding: 28rpx;
}
.name-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18rpx;
}
.service-name {
  min-width: 0;
  color: #17211c;
  font-size: 34rpx;
  font-weight: 650;
  overflow-wrap: anywhere;
}
.service-summary {
  display: -webkit-box;
  margin-top: 12rpx;
  overflow: hidden;
  color: #515b56;
  font-size: 26rpx;
  line-height: 1.6;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.service-meta {
  display: flex;
  align-items: flex-start;
  gap: 8rpx;
  margin-top: 18rpx;
  color: #69716c;
  font-size: 23rpx;
  line-height: 1.5;
}
</style>
