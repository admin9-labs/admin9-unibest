<script lang="ts" setup>
import type { Consultation } from '@/api/consultations'
import type { HttpError } from '@/http/types'
import { ref } from 'vue'
import { queryGuestConsultation } from '@/api/consultations'
import ConsultationProgressView from '@/components/ConsultationProgressView.vue'
import PublicState from '@/components/PublicState.vue'
import { getConsultationCredential } from '@/utils/consultation-credential'
import { currentH5Ticket } from '@/utils/h5-route-ticket'

definePage({ style: { navigationBarTitleText: '咨询进度' } })
const ticket = ref('')
const item = ref<Consultation | null>(null)
const loading = ref(true)
const missing = ref(false)
const failed = ref(false)
async function load() {
  const credential = getConsultationCredential(ticket.value)
  if (!ticket.value || !credential) {
    loading.value = false
    missing.value = true
    return
  }
  loading.value = true
  missing.value = false
  failed.value = false
  try {
    item.value = (await queryGuestConsultation(ticket.value, credential)).consultation
  }
  catch (error) {
    missing.value = (error as HttpError).statusCode === 404
    failed.value = !missing.value
  }
  finally {
    loading.value = false
  }
}
onLoad((query) => {
  ticket.value
    = currentH5Ticket()
      || (typeof query?.ticket === 'string' ? decodeURIComponent(query.ticket) : '')
  load()
})
function manualQuery() {
  uni.redirectTo({ url: '/pages/consultations/query' })
}
</script>

<template>
  <view class="page">
    <PublicState v-if="loading" kind="loading" title="正在查询咨询进度" />
    <PublicState v-else-if="missing" kind="not-found" title="当前设备没有有效凭证，或该工单已失效" description="可以重新输入工单号和查询凭证。" action-text="输入凭证查询" @action="manualQuery" />
    <PublicState v-else-if="failed" kind="network-error" title="咨询进度暂时无法加载" description="请检查网络后重新尝试。" action-text="重新加载" @action="load" />
    <ConsultationProgressView v-else-if="item" :item="item" />
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  max-width: var(--lx-page-max);
  margin: 0 auto;
  padding: 32rpx var(--lx-space-page) calc(60rpx + env(safe-area-inset-bottom));
  background: var(--lx-color-surface);
  box-sizing: border-box;
}
</style>
