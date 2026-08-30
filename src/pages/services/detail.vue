<script lang="ts" setup>
import type { ServiceInformation } from '@/api/service-information'
import type { HttpError } from '@/http/types'
import { computed, ref } from 'vue'
import { getServiceInformationDetail } from '@/api/service-information'
import NearbyPlaces from '@/components/NearbyPlaces.vue'
import PublicContentBody from '@/components/PublicContentBody.vue'
import PublicDetailCover from '@/components/PublicDetailCover.vue'
import PublicDetailHeading from '@/components/PublicDetailHeading.vue'
import { openExternalLink } from '@/utils/external-link'

defineOptions({ name: 'ServiceInformationDetail' })
definePage({ style: { navigationBarTitleText: '服务详情' } })
const id = ref<number | null>(null)
const item = ref<ServiceInformation | null>(null)
const loading = ref(true)
const notFound = ref(false)
const failed = ref(false)
const hasLocation = computed(() => Boolean(item.value?.map_eligible))

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
    item.value = await getServiceInformationDetail(id.value)
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
  uni.redirectTo({ url: '/pages/services/index' })
}
function callPhone() {
  if (item.value?.phone)
    uni.makePhoneCall({ phoneNumber: item.value.phone })
}
function openLocation() {
  if (!item.value || item.value.latitude === null || item.value.longitude === null)
    return
  uni.openLocation({ latitude: item.value.latitude, longitude: item.value.longitude, name: item.value.title, address: item.value.address ?? '' })
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
      <wd-loading text="正在加载服务详情" />
    </view>
    <view v-else-if="notFound" class="state">
      <wd-empty tip="该服务信息不存在或已停止展示">
        <template #bottom>
          <wd-button size="small" @click="returnToList">
            返回服务列表
          </wd-button>
        </template>
      </wd-empty>
    </view>
    <view v-else-if="failed" class="state">
      <wd-empty icon="network" tip="服务详情暂时无法加载">
        <template #bottom>
          <wd-button size="small" @click="load">
            重新加载
          </wd-button>
        </template>
      </wd-empty>
    </view>
    <template v-else-if="item">
      <PublicDetailCover :src="item.cover?.url" height="420rpx" />
      <view class="content">
        <PublicDetailHeading :title="item.title" :summary="item.summary">
          <template v-if="item.type" #badge>
            <text class="detail-category">{{ item.type.name }}</text>
          </template>
        </PublicDetailHeading>
        <view class="facts">
          <view v-if="item.provider" class="fact">
            <wd-icon name="user" size="18" /><text>{{ item.provider }}</text>
          </view>
          <view v-if="item.service_area" class="fact">
            <wd-icon name="location" size="18" /><text>服务区域：{{ item.service_area }}</text>
          </view>
          <view v-if="item.address" class="fact">
            <wd-icon name="pushpin" size="18" /><text>{{ item.address }}</text>
          </view>
          <view v-if="item.service_hours" class="fact">
            <wd-icon name="clock-circle" size="18" /><text>{{ item.service_hours }}</text>
          </view>
          <view v-if="item.phone" class="fact action" role="button" @click="callPhone">
            <wd-icon name="phone" size="18" /><text>{{ item.phone }}</text>
          </view>
          <view v-if="hasLocation" class="fact action" role="button" @click="openLocation">
            <wd-icon name="compass" size="18" /><text>打开地图导航</text>
          </view>
        </view>
        <PublicContentBody title="服务说明" :content="item.content" />
        <NearbyPlaces anchor-type="service_information" :anchor-id="item.id" :eligible="item.map_eligible" />
        <view v-if="item.attachments.length" class="section">
          <view class="section-title">
            相关资料
          </view>
          <view class="attachment-list">
            <view v-for="attachment in item.attachments" :key="attachment.url" class="attachment" role="link" @click="openExternalLink(attachment.url)">
              <text>{{ attachment.name }}</text><wd-icon name="arrow-right" size="18" />
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
.attachment-list {
  margin-top: 18rpx;
  overflow: hidden;
  background: var(--lx-color-surface);
  border: 1px solid var(--lx-color-border);
  border-radius: var(--lx-radius-card);
  box-shadow: var(--lx-shadow-card);
}
.attachment {
  display: flex;
  min-width: 0;
  min-height: 96rpx;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
  padding: 20rpx 24rpx;
  color: var(--lx-color-primary-strong);
  font-size: 27rpx;
  box-sizing: border-box;
  overflow-wrap: anywhere;
}
.attachment text {
  min-width: 0;
  overflow-wrap: anywhere;
}
.attachment + .attachment {
  border-top: 1px solid var(--lx-color-border);
}
</style>
