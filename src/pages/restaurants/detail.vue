<script lang="ts" setup>
import type { Restaurant } from '@/api/restaurants'
import type { HttpError } from '@/http/types'
import { computed, ref } from 'vue'
import { getRestaurant } from '@/api/restaurants'
import PublicContentBody from '@/components/PublicContentBody.vue'
import PublicDetailCover from '@/components/PublicDetailCover.vue'
import PublicDetailHeading from '@/components/PublicDetailHeading.vue'

defineOptions({ name: 'RestaurantDetail' })
definePage({ style: { navigationBarTitleText: '餐饮详情' } })

const id = ref<number | null>(null)
const restaurant = ref<Restaurant | null>(null)
const loading = ref(true)
const notFound = ref(false)
const failed = ref(false)
const gallery = computed(() => restaurant.value?.gallery?.map(item => item.url) ?? [])
const hasLocation = computed(() => Boolean(restaurant.value && restaurant.value.latitude !== null && restaurant.value.longitude !== null))

async function load() {
  if (id.value === null) {
    loading.value = false
    notFound.value = true
    return
  }
  loading.value = true
  failed.value = false
  notFound.value = false
  try {
    restaurant.value = await getRestaurant(id.value)
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
function openRelated(type: 'attraction' | 'scenic-spot', target: { id: number }) {
  const path = type === 'attraction' ? 'attractions' : 'scenic-spots'
  uni.navigateTo({ url: `/pages/${path}/detail?id=${target.id}` })
}
function previewGallery(event: { index: number }) {
  const current = gallery.value[event.index]
  if (current)
    uni.previewImage({ current, urls: gallery.value })
}

onLoad((query) => {
  const parsed = Number(query?.id)
  id.value = Number.isInteger(parsed) && parsed > 0 ? parsed : null
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
      <PublicDetailCover :src="restaurant.cover?.url" />
      <view class="content">
        <PublicDetailHeading :title="restaurant.name" :summary="restaurant.summary">
          <template v-if="restaurant.category" #badge>
            <text class="detail-category">{{ restaurant.category.name }}</text>
          </template>
        </PublicDetailHeading>
        <view class="facts">
          <view v-if="restaurant.address" class="fact">
            <wd-icon name="location" size="18" /><text>{{ restaurant.address }}</text>
          </view>
          <view v-if="restaurant.opening_hours" class="fact">
            <wd-icon name="clock-circle" size="18" /><text>{{ restaurant.opening_hours }}</text>
          </view>
          <view v-if="restaurant.average_price !== null" class="fact">
            <wd-icon name="tag" size="18" /><text>人均约 ¥{{ restaurant.average_price }}</text>
          </view>
          <view v-if="restaurant.phone" class="fact action" role="button" @click="callPhone">
            <wd-icon name="phone" size="18" /><text>{{ restaurant.phone }}</text>
          </view>
          <view v-if="hasLocation" class="fact action" role="button" @click="openLocation">
            <wd-icon name="compass" size="18" /><text>打开地图导航</text>
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
          </view>
          <wd-swiper class="gallery" :list="gallery" height="220" :autoplay="false" radius="8" @click="previewGallery" />
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
  background: var(--lx-color-surface-muted);
}
.state {
  display: flex;
  min-height: 78vh;
  align-items: center;
  justify-content: center;
  padding: 28rpx;
}
.content {
  width: 100%;
  max-width: 960rpx;
  margin: 0 auto;
  padding: 36rpx 28rpx calc(72rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}
.detail-category {
  color: var(--lx-color-text-tertiary);
  font-size: 23rpx;
  line-height: 1.5;
}
.facts {
  margin-top: 32rpx;
  padding: 8rpx 24rpx;
  background: var(--lx-color-surface);
  border: 1px solid var(--lx-color-border);
  border-radius: var(--lx-radius-card);
  box-shadow: var(--lx-shadow-card);
}
.fact {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  gap: 16rpx;
  padding: 22rpx 0;
  color: var(--lx-color-text-secondary);
  font-size: 26rpx;
  line-height: 1.5;
}
.fact text {
  min-width: 0;
  overflow-wrap: anywhere;
}
.fact + .fact {
  border-top: 1px solid var(--lx-color-border);
}
.fact.action {
  color: var(--lx-color-primary-strong);
}
.section {
  margin-top: 40rpx;
}
.section-title {
  color: var(--lx-color-text-main);
  font-size: 31rpx;
  font-weight: 650;
}
.gallery {
  display: block;
  margin-top: 18rpx;
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
  background: var(--lx-color-surface);
  border: 1px solid var(--lx-color-border);
  border-radius: var(--lx-radius-card);
  box-shadow: var(--lx-shadow-card);
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
.related > view {
  min-width: 0;
}
.related + .related {
  border-top: 1px solid var(--lx-color-border);
}
.related-kind {
  color: var(--lx-color-primary-strong);
  font-size: 22rpx;
}
.related-name {
  margin-top: 5rpx;
  color: var(--lx-color-text-main);
  font-size: 28rpx;
  font-weight: 600;
  overflow-wrap: anywhere;
}
</style>
