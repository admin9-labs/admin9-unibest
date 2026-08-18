<script lang="ts" setup>
import { ref } from 'vue'
import PublicState from '@/components/PublicState.vue'
import WorkOrderReceipt from '@/components/WorkOrderReceipt.vue'
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
    <WorkOrderReceipt v-if="ticket && credential" title="投诉已提交" :ticket="ticket" :credential="credential" @copy="copy" @view="query" />
    <PublicState v-else kind="not-found" title="当前设备未找到该工单的查询凭证" description="可以手动输入工单号和查询凭证。" action-text="手动输入凭证查询" @action="manualQuery" />
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  max-width: 760rpx;
  margin: 0 auto;
  padding: 40rpx var(--lx-space-page) calc(60rpx + env(safe-area-inset-bottom));
  background: var(--lx-color-surface);
  box-sizing: border-box;
}
</style>
