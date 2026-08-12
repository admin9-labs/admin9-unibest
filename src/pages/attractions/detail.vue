<script lang="ts" setup>
import type { Attraction } from '@/api/attractions'
import type { HttpError } from '@/http/types'
import { ref } from 'vue'
import { getAttraction } from '@/api/attractions'

defineOptions({ name: 'AttractionDetail' })
definePage({ style: { navigationBarTitleText: '景区详情' } })

const code = ref('')
const attraction = ref<Attraction | null>(null)
const loading = ref(true)
const notFound = ref(false)
const failed = ref(false)

async function load() {
  if (!code.value) {
    loading.value = false
    notFound.value = true
    return
  }
  loading.value = true
  failed.value = false
  notFound.value = false
  try {
    attraction.value = await getAttraction(code.value)
  }
  catch (error) {
    notFound.value = (error as HttpError).statusCode === 404
    failed.value = !notFound.value
  }
  finally {
    loading.value = false
  }
}

function returnToList() {
  uni.redirectTo({ url: '/pages/attractions/index' })
}

function callPhone() {
  if (attraction.value?.phone)
    uni.makePhoneCall({ phoneNumber: attraction.value.phone })
}

function openScenicSpot(spotCode: string) {
  uni.navigateTo({ url: `/pages/scenic-spots/detail?code=${encodeURIComponent(spotCode)}` })
}

onLoad((query) => {
  code.value = typeof query?.code === 'string' ? decodeURIComponent(query.code) : ''
  load()
})
</script>

<template>
  <view class="page">
    <view v-if="loading" class="state">
      <wd-loading text="正在加载景区详情" />
    </view>
    <view v-else-if="notFound" class="state">
      <wd-empty tip="该景区不存在或已停止展示">
        <template #bottom>
          <wd-button size="small" @click="returnToList">
            返回景区列表
          </wd-button>
        </template>
      </wd-empty>
    </view>
    <view v-else-if="failed" class="state">
      <wd-empty icon="network" tip="景区详情暂时无法加载">
        <template #bottom>
          <wd-button size="small" @click="load">
            重新加载
          </wd-button>
        </template>
      </wd-empty>
    </view>
    <template v-else-if="attraction">
      <wd-img v-if="attraction.cover?.url" :src="attraction.cover.url" width="100%" height="440rpx" mode="aspectFill" radius="0" enable-preview />
      <view v-else class="hero-placeholder">
        <wd-icon name="picture" size="38" /><text>旅享西昌</text>
      </view>
      <view class="content">
        <view class="title">
          {{ attraction.name }}
        </view>
        <view v-if="attraction.summary" class="summary">
          {{ attraction.summary }}
        </view>
        <view class="facts">
          <view v-if="attraction.address" class="fact">
            <wd-icon name="location" size="18" /><text>{{ attraction.address }}</text>
          </view>
          <view v-if="attraction.opening_hours" class="fact">
            <wd-icon name="time" size="18" /><text>{{ attraction.opening_hours }}</text>
          </view>
          <view v-if="attraction.ticket_info" class="fact">
            <wd-icon name="money-circle" size="18" /><text>{{ attraction.ticket_info }}</text>
          </view>
          <view v-if="attraction.phone" class="fact action" role="button" @click="callPhone">
            <wd-icon name="phone" size="18" /><text>{{ attraction.phone }}</text>
          </view>
        </view>
        <view v-if="attraction.description" class="section">
          <view class="section-title">
            景区介绍
          </view>
          <view class="long-text">
            {{ attraction.description }}
          </view>
        </view>
        <view v-if="attraction.scenic_spots?.length" class="section">
          <view class="section-title">
            景区内景点
          </view>
          <view class="related-list">
            <view v-for="spot in attraction.scenic_spots" :key="spot.code" class="related" role="link" @click="openScenicSpot(spot.code)">
              <view class="related-copy">
                <view class="related-name">
                  {{ spot.name }}
                </view><view v-if="spot.summary" class="related-summary">
                  {{ spot.summary }}
                </view>
              </view>
              <wd-icon name="arrow-right" size="18" color="#69716c" />
            </view>
          </view>
        </view>
      </view>
    </template>
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f4f6f3;
}
.state {
  display: flex;
  min-height: 78vh;
  align-items: center;
  justify-content: center;
  padding: 28rpx;
}
.hero-placeholder {
  display: flex;
  height: 440rpx;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14rpx;
  color: #607068;
  background: #dfe8e1;
  font-size: 24rpx;
}
.content {
  padding: 36rpx 28rpx 72rpx;
}
.title {
  color: #17211c;
  font-size: 46rpx;
  font-weight: 700;
  line-height: 1.3;
  overflow-wrap: anywhere;
}
.summary {
  margin-top: 18rpx;
  color: #515b56;
  font-size: 28rpx;
  line-height: 1.7;
}
.facts {
  margin-top: 32rpx;
  padding: 8rpx 24rpx;
  background: #fff;
  border: 1px solid #dfe5e0;
  border-radius: 8px;
}
.fact {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  padding: 22rpx 0;
  color: #3f4944;
  font-size: 26rpx;
  line-height: 1.5;
}
.fact + .fact {
  border-top: 1px solid #edf0ed;
}
.action {
  color: #23744f;
}
.section {
  margin-top: 40rpx;
}
.section-title {
  color: #25302a;
  font-size: 31rpx;
  font-weight: 650;
}
.long-text {
  margin-top: 18rpx;
  color: #434d48;
  font-size: 28rpx;
  line-height: 1.85;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.related-list {
  margin-top: 18rpx;
  overflow: hidden;
  background: #fff;
  border: 1px solid #dfe5e0;
  border-radius: 8px;
}
.related {
  display: flex;
  align-items: center;
  gap: 20rpx;
  min-height: 108rpx;
  padding: 22rpx 24rpx;
  box-sizing: border-box;
}
.related + .related {
  border-top: 1px solid #edf0ed;
}
.related-copy {
  flex: 1;
  min-width: 0;
}
.related-name {
  color: #25302a;
  font-size: 28rpx;
  font-weight: 600;
}
.related-summary {
  margin-top: 8rpx;
  overflow: hidden;
  color: #69716c;
  font-size: 24rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
