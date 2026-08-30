<script lang="ts" setup>
import type { ParkingFacility } from '@/api/parking-facilities'
import type { HttpError } from '@/http/types'
import { ref } from 'vue'
import { getParkingFacility } from '@/api/parking-facilities'
import NearbyPlaces from '@/components/NearbyPlaces.vue'
import PublicContentBody from '@/components/PublicContentBody.vue'
import PublicDetailHeading from '@/components/PublicDetailHeading.vue'
import PublicState from '@/components/PublicState.vue'

defineOptions({ name: 'ParkingFacilityDetail' })
definePage({ style: { navigationBarTitleText: '停车设施详情' } })

const id = ref<number | null>(null)
const item = ref<ParkingFacility | null>(null)
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
    item.value = await getParkingFacility(id.value)
  }
  catch (error) {
    notFound.value = (error as HttpError).statusCode === 404
    failed.value = !notFound.value
  }
  finally {
    loading.value = false
  }
}

function openLocation() {
  if (!item.value?.map_eligible || item.value.latitude === null || item.value.longitude === null)
    return
  uni.openLocation({ latitude: item.value.latitude, longitude: item.value.longitude, name: item.value.name, address: item.value.address ?? '' })
}

function callPhone() {
  if (item.value?.phone)
    uni.makePhoneCall({ phoneNumber: item.value.phone })
}

onLoad((query) => {
  const value = Number(query?.id)
  id.value = Number.isInteger(value) && value > 0 ? value : null
  load()
})
</script>

<template>
  <view class="page">
    <view v-if="loading" class="state">
      <PublicState kind="loading" title="正在加载停车设施" />
    </view>
    <view v-else-if="notFound" class="state">
      <PublicState kind="not-found" title="该停车设施不存在或已停止展示" />
    </view>
    <view v-else-if="failed" class="state">
      <PublicState kind="network-error" title="停车设施暂时无法加载" action-text="重新加载" @action="load" />
    </view>
    <view v-else-if="item" class="content">
      <PublicDetailHeading :title="item.name" :summary="item.summary">
        <template #badge>
          <text class="badge">{{ item.type === 'parking_lot' ? '停车场' : '停车点' }}</text>
        </template>
      </PublicDetailHeading>
      <view class="facts">
        <view v-if="item.address" class="fact">
          <wd-icon name="location" size="18" /><text>{{ item.address }}</text>
        </view>
        <view v-if="item.opening_hours" class="fact">
          <wd-icon name="clock-circle" size="18" /><text>{{ item.opening_hours }}</text>
        </view>
        <view v-if="item.fee_info" class="fact">
          <wd-icon name="money-circle" size="18" /><text>{{ item.fee_info }}</text>
        </view>
        <view v-if="item.total_spaces !== null" class="fact">
          <wd-icon name="view" size="18" /><text>总车位 {{ item.total_spaces }}</text>
        </view>
        <view v-if="item.phone" class="fact action" @click="callPhone">
          <wd-icon name="phone" size="18" /><text>{{ item.phone }}</text>
        </view>
        <view v-if="item.map_eligible" class="fact action" @click="openLocation">
          <wd-icon name="compass" size="18" /><text>打开地图导航</text>
        </view>
      </view>
      <PublicContentBody title="设施说明" :content="item.description" />
      <NearbyPlaces anchor-type="parking_facility" :anchor-id="item.id" :eligible="item.map_eligible" />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: var(--lx-color-surface-muted);
}
.state {
  min-height: 78vh;
  padding: 28rpx;
}
.content {
  width: 100%;
  max-width: var(--lx-page-max);
  min-height: 100vh;
  margin: 0 auto;
  padding: 36rpx var(--lx-space-page) calc(72rpx + env(safe-area-inset-bottom));
  background: var(--lx-color-surface);
  box-sizing: border-box;
}
.badge {
  color: var(--lx-color-primary-strong);
  font-size: 23rpx;
}
.facts {
  margin-top: 26rpx;
  border-top: 1px solid var(--lx-color-border-strong);
}
.fact {
  display: flex;
  min-height: 76rpx;
  align-items: center;
  gap: 14rpx;
  color: var(--lx-color-text-secondary);
  border-bottom: 1px solid var(--lx-color-border);
  font-size: 25rpx;
}
.fact.action {
  color: var(--lx-color-primary-strong);
}
</style>
