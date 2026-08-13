<script lang="ts" setup>
import type { Restaurant } from '@/api/restaurants'
import type { HttpError } from '@/http/types'
import { computed, ref } from 'vue'
import { getRestaurant } from '@/api/restaurants'
import PublicContentBody from '@/components/PublicContentBody.vue'

defineOptions({ name: 'RestaurantDetail' })
definePage({ style: { navigationBarTitleText: '餐饮详情' } })

const code = ref('')
const restaurant = ref<Restaurant | null>(null)
const loading = ref(true)
const notFound = ref(false)
const failed = ref(false)
const gallery = computed(() => restaurant.value?.gallery?.map(item => item.url) ?? [])
const hasLocation = computed(() => restaurant.value?.latitude !== null && restaurant.value?.longitude !== null)

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
    restaurant.value = await getRestaurant(code.value)
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
  uni.redirectTo({ url: '/pages/restaurants/index' })
}
function callPhone() {
  if (restaurant.value?.phone)
    uni.makePhoneCall({ phoneNumber: restaurant.value.phone })
}
function openLocation() {
  const item = restaurant.value
  if (item?.latitude === null || item?.longitude === null || !item)
    return
  uni.openLocation({ latitude: item.latitude, longitude: item.longitude, name: item.name, address: item.address ?? '' })
}
function openRelated(type: 'attraction' | 'scenic-spot', target: { code: string }) {
  const path = type === 'attraction' ? 'attractions' : 'scenic-spots'
  uni.navigateTo({ url: `/pages/${path}/detail?code=${encodeURIComponent(target.code)}` })
}

onLoad((query) => {
  code.value = typeof query?.code === 'string' ? decodeURIComponent(query.code) : ''
  load()
})
</script>

<template>
  <view class="page">
    <view v-if="loading" class="state">
      <wd-loading text="正在加载餐饮详情" />
    </view>
    <view v-else-if="notFound" class="state">
      <wd-empty tip="该餐厅不存在或已停止展示">
        <template #bottom>
          <wd-button size="small" @click="returnToList">
            返回餐饮列表
          </wd-button>
        </template>
      </wd-empty>
    </view>
    <view v-else-if="failed" class="state">
      <wd-empty icon="network" tip="餐饮详情暂时无法加载">
        <template #bottom>
          <wd-button size="small" @click="load">
            重新加载
          </wd-button>
        </template>
      </wd-empty>
    </view>
    <template v-else-if="restaurant">
      <wd-img v-if="restaurant.cover?.url" :src="restaurant.cover.url" width="100%" height="440rpx" mode="aspectFill" radius="0" enable-preview />
      <view v-else class="hero-placeholder">
        <wd-icon name="food" size="40" /><text>西昌味道</text>
      </view>
      <view class="content">
        <view class="heading">
          <view class="title">
            {{ restaurant.name }}
          </view>
          <wd-tag v-if="restaurant.category" type="success" variant="light">
            {{ restaurant.category.name }}
          </wd-tag>
        </view>
        <view v-if="restaurant.summary" class="summary">
          {{ restaurant.summary }}
        </view>
        <view class="facts">
          <view v-if="restaurant.address" class="fact">
            <wd-icon name="location" size="18" /><text>{{ restaurant.address }}</text>
          </view>
          <view v-if="restaurant.opening_hours" class="fact">
            <wd-icon name="time" size="18" /><text>{{ restaurant.opening_hours }}</text>
          </view>
          <view v-if="restaurant.average_price !== null" class="fact">
            <wd-icon name="money-circle" size="18" /><text>人均约 ¥{{ restaurant.average_price }}</text>
          </view>
          <view v-if="restaurant.phone" class="fact action" role="button" @click="callPhone">
            <wd-icon name="phone" size="18" /><text>{{ restaurant.phone }}</text>
          </view>
          <view v-if="hasLocation" class="fact action" role="button" @click="openLocation">
            <wd-icon name="navigation" size="18" /><text>打开地图导航</text>
          </view>
        </view>
        <view v-if="restaurant.signature_dishes?.length" class="section">
          <view class="section-title">
            招牌菜
          </view>
          <view class="dish-list">
            <wd-tag v-for="dish in restaurant.signature_dishes" :key="dish" type="volcano" variant="light" size="large">
              {{ dish }}
            </wd-tag>
          </view>
        </view>
        <PublicContentBody title="餐厅介绍" :content="restaurant.description" />
        <view v-if="gallery.length" class="section">
          <view class="section-title">
            餐厅相册
          </view><wd-swiper :list="gallery" height="220" :autoplay="false" radius="8" />
        </view>
        <view v-if="restaurant.attraction || restaurant.scenic_spot" class="section">
          <view class="section-title">
            附近文旅内容
          </view>
          <view class="related-list">
            <view v-if="restaurant.attraction" class="related" role="link" @click="openRelated('attraction', restaurant.attraction)">
              <view>
                <view class="related-kind">
                  景区
                </view><view class="related-name">
                  {{ restaurant.attraction.name }}
                </view>
              </view><wd-icon name="arrow-right" size="18" />
            </view>
            <view v-if="restaurant.scenic_spot" class="related" role="link" @click="openRelated('scenic-spot', restaurant.scenic_spot)">
              <view>
                <view class="related-kind">
                  景点
                </view><view class="related-name">
                  {{ restaurant.scenic_spot.name }}
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
  color: #7b4f43;
  background: #eee4df;
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
  border: 1px solid #e5dedb;
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
  border-top: 1px solid #eee8e5;
}
.fact.action {
  color: #9b3f2e;
}
.section {
  margin-top: 40rpx;
}
.section-title {
  color: #25302a;
  font-size: 31rpx;
  font-weight: 650;
}
.dish-list {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
  margin-top: 18rpx;
}
.related-list {
  margin-top: 18rpx;
  overflow: hidden;
  background: #fff;
  border: 1px solid #e5dedb;
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
  border-top: 1px solid #eee8e5;
}
.related-kind {
  color: #9b3f2e;
  font-size: 22rpx;
}
.related-name {
  margin-top: 5rpx;
  color: #25302a;
  font-size: 28rpx;
  font-weight: 600;
}
</style>
