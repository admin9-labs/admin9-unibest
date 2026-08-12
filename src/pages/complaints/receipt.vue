<script lang="ts" setup>
import { ref } from 'vue'
import { getComplaintCredential } from '@/utils/complaint-credential'

definePage({ style: { navigationBarTitleText: '提交成功' } })
const ticket = ref('')
const credential = ref('')
onLoad((query) => {
  ticket.value = typeof query?.ticket === 'string' ? decodeURIComponent(query.ticket) : ''
  credential.value = getComplaintCredential(ticket.value) || ''
})
function copy(value: string) {
  uni.setClipboardData({ data: value })
}
function query() {
  uni.redirectTo({ url: `/pages/complaints/detail?ticket=${encodeURIComponent(ticket.value)}` })
}
function manualQuery() {
  uni.redirectTo({ url: '/pages/complaints/query' })
}
</script>

<template>
  <view class="page">
    <view v-if="ticket && credential" class="receipt">
      <wd-icon name="check-circle" size="54" color="#23744f" /><view class="title">
        投诉已提交
      </view><view class="warning">
        查询凭证只用于查看此工单，请勿转发给他人。凭证不会出现在分享链接中。
      </view>
      <view class="field">
        <text>工单号</text><view class="value">
          {{ ticket }}
        </view><wd-button size="small" plain @click="copy(ticket)">
          复制
        </wd-button>
      </view>
      <view class="field">
        <text>查询凭证</text><view class="value credential">
          {{ credential }}
        </view><wd-button size="small" plain @click="copy(credential)">
          复制
        </wd-button>
      </view>
      <wd-button block size="large" @click="query">
        查看办理进度
      </wd-button>
    </view>
    <view v-else class="missing">
      <wd-empty tip="当前设备未找到该工单的查询凭证" /><wd-button block @click="manualQuery">
        手动输入凭证查询
      </wd-button>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  padding: 36rpx 28rpx;
  background: #f4f6f3;
  box-sizing: border-box;
}
.receipt {
  padding: 42rpx 28rpx;
  background: #fff;
  border: 1px solid #dbe4df;
  border-radius: 8px;
}
.title {
  margin-top: 18rpx;
  color: #17211c;
  font-size: 40rpx;
  font-weight: 700;
}
.warning {
  margin: 16rpx 0 28rpx;
  padding: 20rpx;
  color: #735c1d;
  background: #fff8df;
  border-radius: 6px;
  font-size: 24rpx;
  line-height: 1.6;
}
.field {
  margin-bottom: 24rpx;
}
.field > text {
  color: #69716c;
  font-size: 23rpx;
}
.value {
  margin: 8rpx 0 12rpx;
  color: #17211c;
  font-size: 28rpx;
  overflow-wrap: anywhere;
}
.credential {
  font-family: monospace;
  font-size: 23rpx;
}
.missing {
  padding-top: 25vh;
}
</style>
