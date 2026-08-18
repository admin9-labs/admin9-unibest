<script lang="ts" setup>
import type { Attraction } from '@/api/attractions'
import type { HttpError } from '@/http/types'
import { ref } from 'vue'
import { getAttraction } from '@/api/attractions'
import DestinationVisitInfo from '@/components/DestinationVisitInfo.vue'
import PublicContentBody from '@/components/PublicContentBody.vue'
import PublicDetailCover from '@/components/PublicDetailCover.vue'
import PublicDetailHeading from '@/components/PublicDetailHeading.vue'
import PublicState from '@/components/PublicState.vue'

defineOptions({ name: 'AttractionDetail' })
definePage({ style: { navigationBarTitleText: '景区详情' } })

const id = ref<number | null>(null)
const attraction = ref<Attraction | null>(null)
const loading = ref(true)
const notFound = ref(false)
const failed = ref(false)

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
    attraction.value = await getAttraction(id.value)
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

function openScenicSpot(spotId: number) {
  uni.navigateTo({ url: `/pages/scenic-spots/detail?id=${spotId}` })
}

onLoad((query) => {
  const value = Number(query?.id)
  id.value = Number.isInteger(value) && value > 0 ? value : null
  load()
})
</script>

<template>
  <view class="page">
    <view v-if="loading" class="state-shell">
      <PublicState kind="loading" title="正在加载景区详情" />
    </view>
    <view v-else-if="notFound" class="state-shell">
      <PublicState kind="not-found" title="该景区不存在或已停止展示" action-text="返回景区列表" @action="returnToList" />
    </view>
    <view v-else-if="failed" class="state-shell">
      <PublicState kind="network-error" title="景区详情暂时无法加载" description="请检查网络后重新尝试。" action-text="重新加载" @action="load" />
    </view>
    <template v-else-if="attraction">
      <view class="detail-shell">
        <PublicDetailCover :src="attraction.cover?.url" />
        <view class="content">
          <PublicDetailHeading :title="attraction.name" :summary="attraction.summary" />
          <DestinationVisitInfo :address="attraction.address" :opening-hours="attraction.opening_hours" :ticket-info="attraction.ticket_info" :phone="attraction.phone" @call="callPhone" />
          <PublicContentBody title="景区介绍" :content="attraction.description" />
          <view v-if="attraction.scenic_spots?.length" class="section">
            <view class="section-title">
              景区内景点
            </view>
            <view class="related-list">
              <view v-for="spot in attraction.scenic_spots" :key="spot.id" class="related" role="link" @click="openScenicSpot(spot.id)">
                <view class="related-media">
                  <wd-img v-if="spot.cover?.url" :src="spot.cover.url" width="100%" height="100%" mode="aspectFill" radius="0" />
                  <wd-icon v-else name="image" size="22" />
                </view>
                <view class="related-copy">
                  <view class="related-name">
                    {{ spot.name }}
                  </view><view v-if="spot.summary" class="related-summary">
                    {{ spot.summary }}
                  </view>
                </view>
              </view>
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
.state-shell {
  max-width: var(--lx-page-max);
  min-height: 78vh;
  margin: 0 auto;
  padding: 28rpx 28rpx calc(28rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}
.detail-shell {
  width: 100%;
  max-width: var(--lx-page-max);
  margin: 0 auto;
  overflow: hidden;
  background: var(--lx-color-surface);
}
.content {
  padding: 36rpx var(--lx-space-page) calc(72rpx + env(safe-area-inset-bottom));
}
.section {
  margin-top: 40rpx;
}
.section-title {
  color: var(--lx-color-text-main);
  font-size: 31rpx;
  font-weight: 650;
}
.related-list {
  margin-top: 18rpx;
  border-top: 1px solid var(--lx-color-border-strong);
}
.related {
  display: flex;
  align-items: center;
  gap: 20rpx;
  min-height: 124rpx;
  padding: 20rpx 0;
  box-sizing: border-box;
}
.related + .related {
  border-top: 1px solid var(--lx-color-border);
}
.related-media {
  display: flex;
  width: 116rpx;
  aspect-ratio: 4 / 3;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: var(--lx-color-text-tertiary);
  background: #e5ecea;
  border-radius: var(--lx-radius-media);
}
.related-copy {
  flex: 1;
  min-width: 0;
}
.related-name {
  color: var(--lx-color-text-main);
  font-size: 28rpx;
  font-weight: 600;
  overflow-wrap: anywhere;
}
.related-summary {
  margin-top: 8rpx;
  color: var(--lx-color-text-tertiary);
  font-size: 24rpx;
  line-height: 1.5;
  overflow-wrap: anywhere;
}
</style>
