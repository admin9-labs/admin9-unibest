<script lang="ts" setup>
import type { Complaint } from '@/api/complaints'
import type { HttpError } from '@/http/types'
import { ref } from 'vue'
import ComplaintProgressView from '@/components/ComplaintProgressView.vue'
import { queryGuestComplaint } from '@/api/complaints'
import { getComplaintCredential } from '@/utils/complaint-credential'
import { currentH5Ticket } from '@/utils/h5-route-ticket'

definePage({ style: { navigationBarTitleText: '投诉进度' } })
const ticket = ref('')
const item = ref<Complaint | null>(null)
const loading = ref(true)
const missing = ref(false)
const failed = ref(false)
async function load() {
  const credential = getComplaintCredential(ticket.value)
  if (!ticket.value || !credential) {
    loading.value = false
    missing.value = true
    return
  }
  loading.value = true
  missing.value = false
  failed.value = false
  try {
    item.value = (await queryGuestComplaint(ticket.value, credential)).complaint
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
  ticket.value = typeof query?.ticket === 'string' ? decodeURIComponent(query.ticket) : ''
  load()
})
function manualQuery() {
  uni.redirectTo({ url: '/pages/complaints/query' })
}
function syncH5Ticket() {
  const next = currentH5Ticket()
  if (next === ticket.value)
    return
  ticket.value = next
  item.value = null
  load()
}
onMounted(() => window.addEventListener('hashchange', syncH5Ticket))
onUnmounted(() => window.removeEventListener('hashchange', syncH5Ticket))
</script>

<template>
  <view class="page">
    <view v-if="loading" class="state">
      <wd-loading text="正在查询投诉进度" />
    </view><view v-else-if="missing" class="state">
      <wd-empty tip="当前设备没有有效凭证，或该工单已失效">
        <template #bottom>
          <wd-button size="small" @click="manualQuery">
            输入凭证查询
          </wd-button>
        </template>
      </wd-empty>
    </view><view v-else-if="failed" class="state">
      <wd-empty icon="network" tip="投诉进度暂时无法加载">
        <template #bottom>
          <wd-button size="small" @click="load">
            重新加载
          </wd-button>
        </template>
      </wd-empty>
    </view><ComplaintProgressView v-else-if="item" :item="item" />
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  padding: 28rpx;
  background: #f4f6f3;
  box-sizing: border-box;
}
.state {
  display: flex;
  min-height: 75vh;
  align-items: center;
  justify-content: center;
}
</style>
