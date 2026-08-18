<script lang="ts" setup>
import type { Accommodation } from '@/api/accommodations'
import type { HttpError } from '@/http/types'
import { computed, ref } from 'vue'
import { getAccommodation } from '@/api/accommodations'
import PublicContentBody from '@/components/PublicContentBody.vue'
import PublicDetailCover from '@/components/PublicDetailCover.vue'
import PublicDetailHeading from '@/components/PublicDetailHeading.vue'

defineOptions({ name: 'AccommodationDetail' })
definePage({ style: { navigationBarTitleText: '住宿详情' } })
const id = ref<number | null>(null)
const item = ref<Accommodation | null>(null)
const loading = ref(true)
const notFound = ref(false)
const failed = ref(false)
const gallery = computed(() => item.value?.gallery?.map(image => image.url) ?? [])
const hasLocation = computed(() => Boolean(item.value && item.value.latitude !== null && item.value.longitude !== null))

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
    item.value = await getAccommodation(id.value)
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
function openRelated(type: 'attraction' | 'scenic-spot', target: { id: number }) {
  uni.navigateTo({ url: `/pages/${type === 'attraction' ? 'attractions' : 'scenic-spots'}/detail?id=${target.id}` })
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
      <PublicDetailCover :src="item.cover?.url" />
      <view class="content">
        <PublicDetailHeading :title="item.name" :summary="item.summary">
          <template v-if="item.category" #badge>
            <text class="detail-category">{{ item.category.name }}</text>
          </template>
        </PublicDetailHeading>
        <view class="facts">
          <view v-if="item.address" class="fact">
            <wd-icon name="location" size="18" /><text>{{ item.address }}</text>
          </view>
          <view v-if="item.check_in_time || item.check_out_time" class="fact">
            <wd-icon name="clock-circle" size="18" /><text>入住 {{ item.check_in_time || '以现场为准' }} · 退房 {{ item.check_out_time || '以现场为准' }}</text>
          </view>
          <view v-if="item.reference_price !== null" class="fact">
            <wd-icon name="tag" size="18" /><text>参考价 ¥{{ item.reference_price }} 起</text>
          </view>
          <view v-if="item.phone" class="fact action" role="button" @click="callPhone">
            <wd-icon name="phone" size="18" /><text>{{ item.phone }}</text>
          </view>
          <view v-if="hasLocation" class="fact action" role="button" @click="openLocation">
            <wd-icon name="compass" size="18" /><text>打开地图导航</text>
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
        <PublicContentBody title="住宿介绍" :content="item.description" />
        <view v-if="gallery.length" class="section">
          <view class="section-title">
            住宿相册
          </view>
          <wd-swiper class="gallery" :list="gallery" height="220" :autoplay="false" radius="8" @click="previewGallery" />
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
.tag-list {
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
