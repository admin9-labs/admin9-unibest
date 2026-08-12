<script lang="ts" setup>
import type { Accommodation } from '@/api/accommodations'
import type { HttpError } from '@/http/types'
import { computed, ref } from 'vue'
import { getAccommodation } from '@/api/accommodations'

defineOptions({ name: 'AccommodationDetail' })
definePage({ style: { navigationBarTitleText: '住宿详情' } })
const code = ref('')
const item = ref<Accommodation | null>(null)
const loading = ref(true)
const notFound = ref(false)
const failed = ref(false)
const gallery = computed(() => item.value?.gallery?.map(image => image.url) ?? [])
const hasLocation = computed(() => item.value?.latitude !== null && item.value?.longitude !== null)

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
    item.value = await getAccommodation(code.value)
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
  uni.redirectTo({ url: '/pages/accommodations/index' })
}
function callPhone() {
  if (item.value?.phone)
    uni.makePhoneCall({ phoneNumber: item.value.phone })
}
function openLocation() {
  const lodging = item.value
  if (!lodging || lodging.latitude === null || lodging.longitude === null)
    return
  uni.openLocation({ latitude: lodging.latitude, longitude: lodging.longitude, name: lodging.name, address: lodging.address ?? '' })
}
function openRelated(type: 'attraction' | 'scenic-spot', target: { code: string }) {
  uni.navigateTo({ url: `/pages/${type === 'attraction' ? 'attractions' : 'scenic-spots'}/detail?code=${encodeURIComponent(target.code)}` })
}
onLoad((query) => {
  code.value = typeof query?.code === 'string' ? decodeURIComponent(query.code) : ''
  load()
})
</script>

<template>
  <view class="page">
    <view v-if="loading" class="state">
      <wd-loading text="正在加载住宿详情" />
    </view>
    <view v-else-if="notFound" class="state">
      <wd-empty tip="该住宿不存在或已停止展示">
        <template #bottom>
          <wd-button size="small" @click="returnToList">
            返回住宿列表
          </wd-button>
        </template>
      </wd-empty>
    </view>
    <view v-else-if="failed" class="state">
      <wd-empty icon="network" tip="住宿详情暂时无法加载">
        <template #bottom>
          <wd-button size="small" @click="load">
            重新加载
          </wd-button>
        </template>
      </wd-empty>
    </view>
    <template v-else-if="item">
      <wd-img v-if="item.cover?.url" :src="item.cover.url" width="100%" height="440rpx" mode="aspectFill" radius="0" enable-preview />
      <view v-else class="hero-placeholder">
        <wd-icon name="home" size="40" /><text>旅居西昌</text>
      </view>
      <view class="content">
        <view class="heading">
          <view class="title">
            {{ item.name }}
          </view><wd-tag v-if="item.category" type="lightblue" variant="light">
            {{ item.category.name }}
          </wd-tag>
        </view>
        <view v-if="item.summary" class="summary">
          {{ item.summary }}
        </view>
        <view class="facts">
          <view v-if="item.address" class="fact">
            <wd-icon name="location" size="18" /><text>{{ item.address }}</text>
          </view>
          <view v-if="item.check_in_time || item.check_out_time" class="fact">
            <wd-icon name="time" size="18" /><text>入住 {{ item.check_in_time || '以现场为准' }} · 退房 {{ item.check_out_time || '以现场为准' }}</text>
          </view>
          <view v-if="item.reference_price !== null" class="fact">
            <wd-icon name="money-circle" size="18" /><text>参考价 ¥{{ item.reference_price }} 起</text>
          </view>
          <view v-if="item.phone" class="fact action" role="button" @click="callPhone">
            <wd-icon name="phone" size="18" /><text>{{ item.phone }}</text>
          </view>
          <view v-if="hasLocation" class="fact action" role="button" @click="openLocation">
            <wd-icon name="navigation" size="18" /><text>打开地图导航</text>
          </view>
        </view>
        <view v-if="item.facilities?.length" class="section">
          <view class="section-title">
            设施服务
          </view><view class="tag-list">
            <wd-tag v-for="facility in item.facilities" :key="facility" type="cyan" variant="light" size="large">
              {{ facility }}
            </wd-tag>
          </view>
        </view>
        <view v-if="item.description" class="section">
          <view class="section-title">
            住宿介绍
          </view><view class="long-text">
            {{ item.description }}
          </view>
        </view>
        <view v-if="gallery.length" class="section">
          <view class="section-title">
            住宿相册
          </view><wd-swiper :list="gallery" height="220" :autoplay="false" radius="8" />
        </view>
        <view v-if="item.attraction || item.scenic_spot" class="section">
          <view class="section-title">
            附近文旅内容
          </view>
          <view class="related-list">
            <view v-if="item.attraction" class="related" role="link" @click="openRelated('attraction', item.attraction)">
              <view>
                <view class="related-kind">
                  景区
                </view><view class="related-name">
                  {{ item.attraction.name }}
                </view>
              </view><wd-icon name="arrow-right" size="18" />
            </view>
            <view v-if="item.scenic_spot" class="related" role="link" @click="openRelated('scenic-spot', item.scenic_spot)">
              <view>
                <view class="related-kind">
                  景点
                </view><view class="related-name">
                  {{ item.scenic_spot.name }}
                </view>
              </view><wd-icon name="arrow-right" size="18" />
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
  color: #416a73;
  background: #dfe9eb;
  font-size: 24rpx;
}
.content {
  padding: 36rpx 28rpx 72rpx;
}
.heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20rpx;
}
.title {
  min-width: 0;
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
  border: 1px solid #dce4e5;
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
  border-top: 1px solid #e8edef;
}
.fact.action {
  color: #2f6571;
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
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
  margin-top: 18rpx;
}
.related-list {
  margin-top: 18rpx;
  overflow: hidden;
  background: #fff;
  border: 1px solid #dce4e5;
  border-radius: 8px;
}
.related {
  display: flex;
  min-height: 104rpx;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
  padding: 20rpx 24rpx;
  box-sizing: border-box;
}
.related + .related {
  border-top: 1px solid #e8edef;
}
.related-kind {
  color: #2f6571;
  font-size: 22rpx;
}
.related-name {
  margin-top: 5rpx;
  color: #25302a;
  font-size: 28rpx;
  font-weight: 600;
}
</style>
