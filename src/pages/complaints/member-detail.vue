<script lang="ts" setup>
import type { Complaint } from '@/api/complaints'
import type { HttpError } from '@/http/types'
import { ref } from 'vue'
import ComplaintProgressView from '@/components/ComplaintProgressView.vue'
import PublicState from '@/components/PublicState.vue'
import { getMemberComplaint } from '@/api/complaints'
import { currentH5Ticket } from '@/utils/h5-route-ticket'

definePage({ excludeLoginPath: true, style: { navigationBarTitleText: '我的投诉详情' } })
const ticket = ref('')
const item = ref<Complaint | null>(null)
const loading = ref(true)
const notFound = ref(false)
const failed = ref(false)
async function load() {
  if (!ticket.value) {
    loading.value = false
    notFound.value = true
    return
  }
  loading.value = true
  notFound.value = false
  failed.value = false
  try {
    item.value = await getMemberComplaint(ticket.value)
  }
  catch (error) {
    notFound.value = (error as HttpError).statusCode === 404
    failed.value = !notFound.value
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
</script>

<template>
  <view class="page">
    <PublicState v-if="loading" kind="loading" title="正在加载投诉详情" />
    <PublicState v-else-if="notFound" kind="not-found" title="该投诉不存在或不属于当前账号" />
    <PublicState v-else-if="failed" kind="network-error" title="投诉详情暂时无法加载" description="请检查网络后重新尝试。" action-text="重新加载" @action="load" />
    <ComplaintProgressView v-else-if="item" :item="item" member />
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
