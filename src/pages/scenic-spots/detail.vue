<script lang="ts" setup>
import type { ScenicSpot } from '@/api/scenic-spots'
import type { HttpError } from '@/http/types'
import { ref } from 'vue'
import { getScenicSpot } from '@/api/scenic-spots'
import DestinationVisitInfo from '@/components/DestinationVisitInfo.vue'
import PublicContentBody from '@/components/PublicContentBody.vue'
import PublicDetailCover from '@/components/PublicDetailCover.vue'
import PublicDetailHeading from '@/components/PublicDetailHeading.vue'
import PublicState from '@/components/PublicState.vue'

defineOptions({ name: 'ScenicSpotDetail' })
definePage({ style: { navigationBarTitleText: '景点详情' } })

const id = ref<number | null>(null)
const scenicSpot = ref<ScenicSpot | null>(null)
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
    scenicSpot.value = await getScenicSpot(id.value)
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
  uni.redirectTo({ url: '/pages/scenic-spots/index' })
}

function callPhone() {
  if (scenicSpot.value?.phone)
    uni.makePhoneCall({ phoneNumber: scenicSpot.value.phone })
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
      <PublicState kind="loading" title="正在加载景点详情" />
    </view>
    <view v-else-if="notFound" class="state-shell">
      <PublicState kind="not-found" title="该景点不存在或已停止展示" action-text="返回景点列表" @action="returnToList" />
    </view>
    <view v-else-if="failed" class="state-shell">
      <PublicState kind="network-error" title="景点详情暂时无法加载" description="请检查网络后重新尝试。" action-text="重新加载" @action="load" />
    </view>
    <template v-else-if="scenicSpot">
      <view class="detail-shell">
        <PublicDetailCover :src="scenicSpot.cover?.url" />
        <view class="content">
          <PublicDetailHeading :title="scenicSpot.name" :summary="scenicSpot.summary" />
          <DestinationVisitInfo :address="scenicSpot.address" :opening-hours="scenicSpot.opening_hours" :phone="scenicSpot.phone" @call="callPhone" />
          <PublicContentBody title="景点介绍" :content="scenicSpot.description" />
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
</style>
