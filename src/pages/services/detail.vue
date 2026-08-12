<script lang="ts" setup>
import type { ServiceInformation } from '@/api/service-information'
import type { HttpError } from '@/http/types'
import { computed, ref } from 'vue'
import { getServiceInformationDetail } from '@/api/service-information'
import { openExternalLink } from '@/utils/external-link'

defineOptions({ name: 'ServiceInformationDetail' })
definePage({ style: { navigationBarTitleText: '服务详情' } })
const code = ref('')
const item = ref<ServiceInformation | null>(null)
const loading = ref(true)
const notFound = ref(false)
const failed = ref(false)
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
    item.value = await getServiceInformationDetail(code.value)
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
  code.value = typeof query?.code === 'string' ? decodeURIComponent(query.code) : ''
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
      <wd-img v-if="item.cover?.url" :src="item.cover.url" width="100%" height="420rpx" mode="aspectFill" radius="0" enable-preview />
      <view v-else class="hero-placeholder">
        <wd-icon name="service" size="40" /><text>游客服务</text>
      </view>
      <view class="content">
        <view class="heading">
          <view class="title">
            {{ item.title }}
          </view><wd-tag v-if="item.type" type="success" variant="light">
            {{ item.type.name }}
          </wd-tag>
        </view>
        <view v-if="item.summary" class="summary">
          {{ item.summary }}
        </view>
        <view class="facts">
          <view v-if="item.provider" class="fact">
            <wd-icon name="user" size="18" /><text>{{ item.provider }}</text>
          </view>
          <view v-if="item.service_area" class="fact">
            <wd-icon name="location" size="18" /><text>服务区域：{{ item.service_area }}</text>
          </view>
          <view v-if="item.address" class="fact">
            <wd-icon name="pin" size="18" /><text>{{ item.address }}</text>
          </view>
          <view v-if="item.service_hours" class="fact">
            <wd-icon name="time" size="18" /><text>{{ item.service_hours }}</text>
          </view>
          <view v-if="item.phone" class="fact action" role="button" @click="callPhone">
            <wd-icon name="phone" size="18" /><text>{{ item.phone }}</text>
          </view>
          <view v-if="hasLocation" class="fact action" role="button" @click="openLocation">
            <wd-icon name="navigation" size="18" /><text>打开地图导航</text>
          </view>
        </view>
        <view v-if="item.content" class="section">
          <view class="section-title">
            服务说明
          </view><view class="long-text">
            {{ item.content }}
          </view>
        </view>
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
  height: 420rpx;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14rpx;
  color: #246b61;
  background: #e1ece8;
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
  font-size: 44rpx;
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
  border: 1px solid #dbe4df;
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
  border-top: 1px solid #e6ece8;
}
.fact.action {
  color: #246b61;
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
.attachment-list {
  margin-top: 18rpx;
  overflow: hidden;
  background: #fff;
  border: 1px solid #dbe4df;
  border-radius: 8px;
}
.attachment {
  display: flex;
  min-height: 96rpx;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
  padding: 20rpx 24rpx;
  color: #246b61;
  font-size: 27rpx;
  box-sizing: border-box;
  overflow-wrap: anywhere;
}
.attachment + .attachment {
  border-top: 1px solid #e6ece8;
}
</style>
