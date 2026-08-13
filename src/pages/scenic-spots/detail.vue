<script lang="ts" setup>
import type { ScenicSpot } from '@/api/scenic-spots'
import type { HttpError } from '@/http/types'
import { ref } from 'vue'
import { getScenicSpot } from '@/api/scenic-spots'
import PublicContentBody from '@/components/PublicContentBody.vue'

defineOptions({ name: 'ScenicSpotDetail' })
definePage({ style: { navigationBarTitleText: '景点详情' } })

const code = ref('')
const scenicSpot = ref<ScenicSpot | null>(null)
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
    scenicSpot.value = await getScenicSpot(code.value)
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
  code.value = typeof query?.code === 'string' ? decodeURIComponent(query.code) : ''
  load()
})
</script>

<template>
  <view class="page">
    <view v-if="loading" class="state">
      <wd-loading text="正在加载景点详情" />
    </view>
    <view v-else-if="notFound" class="state">
      <wd-empty tip="该景点不存在或已停止展示">
        <template #bottom>
          <wd-button size="small" @click="returnToList">
            返回景点列表
          </wd-button>
        </template>
      </wd-empty>
    </view>
    <view v-else-if="failed" class="state">
      <wd-empty icon="network" tip="景点详情暂时无法加载">
        <template #bottom>
          <wd-button size="small" @click="load">
            重新加载
          </wd-button>
        </template>
      </wd-empty>
    </view>
    <template v-else-if="scenicSpot">
      <wd-img v-if="scenicSpot.cover?.url" :src="scenicSpot.cover.url" width="100%" height="440rpx" mode="aspectFill" radius="0" enable-preview />
      <view v-else class="hero-placeholder">
        <wd-icon name="picture" size="38" /><text>旅享西昌</text>
      </view>
      <view class="content">
        <view class="title">
          {{ scenicSpot.name }}
        </view>
        <view v-if="scenicSpot.summary" class="summary">
          {{ scenicSpot.summary }}
        </view>
        <view class="facts">
          <view v-if="scenicSpot.address" class="fact">
            <wd-icon name="location" size="18" /><text>{{ scenicSpot.address }}</text>
          </view>
          <view v-if="scenicSpot.opening_hours" class="fact">
            <wd-icon name="time" size="18" /><text>{{ scenicSpot.opening_hours }}</text>
          </view>
          <view v-if="scenicSpot.phone" class="fact action" role="button" @click="callPhone">
            <wd-icon name="phone" size="18" /><text>{{ scenicSpot.phone }}</text>
          </view>
        </view>
        <PublicContentBody title="景点介绍" :content="scenicSpot.description" />
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
</style>
