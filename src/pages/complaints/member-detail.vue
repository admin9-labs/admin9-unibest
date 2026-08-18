<script lang="ts" setup>
import type { Complaint } from '@/api/complaints'
import type { HttpError } from '@/http/types'
import { ref } from 'vue'
import ComplaintProgressView from '@/components/ComplaintProgressView.vue'
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
    <view v-if="loading" class="state">
      <wd-loading text="正在加载投诉详情" />
    </view><view v-else-if="notFound" class="state">
      <wd-empty tip="该投诉不存在或不属于当前账号" />
    </view><view v-else-if="failed" class="state">
      <wd-empty icon="network" tip="投诉详情暂时无法加载">
        <template #bottom>
          <wd-button size="small" @click="load">
            重新加载
          </wd-button>
        </template>
      </wd-empty>
    </view><ComplaintProgressView v-else-if="item" :item="item" member />
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
