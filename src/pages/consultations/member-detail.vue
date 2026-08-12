<script lang="ts" setup>
import type { Consultation } from '@/api/consultations'
import type { HttpError } from '@/http/types'
import { ref } from 'vue'
import { getMemberConsultation } from '@/api/consultations'
import {
  consultationStatus,
  formatConsultationTime,
} from '@/utils/consultation'
import { currentH5Ticket } from '@/utils/h5-route-ticket'

definePage({
  excludeLoginPath: true,
  style: { navigationBarTitleText: '我的咨询详情' },
})
const ticket = ref('')
const item = ref<Consultation | null>(null)
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
    item.value = await getMemberConsultation(ticket.value)
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
    = typeof query?.ticket === 'string' ? decodeURIComponent(query.ticket) : ''
  load()
})
function syncH5Ticket() {
  const nextTicket = currentH5Ticket()
  if (nextTicket === ticket.value)
    return
  ticket.value = nextTicket
  item.value = null
  load()
}
onMounted(() => window.addEventListener('hashchange', syncH5Ticket))
onUnmounted(() => window.removeEventListener('hashchange', syncH5Ticket))
</script>

<template>
  <view class="page">
    <view v-if="loading" class="state">
      <wd-loading text="正在加载咨询详情" />
    </view><view v-else-if="notFound" class="state">
      <wd-empty tip="该咨询不存在或不属于当前账号" />
    </view><view v-else-if="failed" class="state">
      <wd-empty icon="network" tip="咨询详情暂时无法加载">
        <template #bottom>
          <wd-button size="small" @click="load">
            重新加载
          </wd-button>
        </template>
      </wd-empty>
    </view><view v-else-if="item" class="content">
      <view class="heading">
        <view class="title">
          {{ item.subject }}
        </view><wd-tag :type="consultationStatus[item.status].type">
          {{
            consultationStatus[item.status].label
          }}
        </wd-tag>
      </view><view class="ticket">
        {{ item.ticket_no }} · {{ item.category?.name || "旅游咨询" }}
      </view><view v-if="item.contact" class="contact">
        <view>{{ item.contact.name }}</view><view v-if="item.contact.mobile">
          {{ item.contact.mobile }}
        </view><view v-if="item.contact.email">
          {{ item.contact.email }}
        </view>
      </view><view class="section">
        <view class="section-title">
          咨询内容
        </view><view class="long-text">
          {{ item.content }}
        </view>
      </view><view v-if="item.reply_content" class="section reply">
        <view class="section-title">
          办理回复
        </view><view class="long-text">
          {{ item.reply_content }}
        </view>
      </view><view v-if="item.close_reason" class="section">
        <view class="section-title">
          关闭说明
        </view><view class="long-text">
          {{ item.close_reason }}
        </view>
      </view><view class="timeline">
        提交时间 {{ formatConsultationTime(item.created_at) }}
      </view>
    </view>
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
.content {
  padding: 32rpx 26rpx;
  background: #fff;
  border: 1px solid #dbe4df;
  border-radius: 8px;
}
.heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18rpx;
}
.title {
  min-width: 0;
  color: #17211c;
  font-size: 38rpx;
  font-weight: 700;
  overflow-wrap: anywhere;
}
.ticket {
  margin-top: 12rpx;
  color: #69716c;
  font-size: 23rpx;
}
.contact {
  margin-top: 24rpx;
  padding: 20rpx;
  background: #f4f6f3;
  color: #4c5651;
  font-size: 24rpx;
  line-height: 1.7;
}
.section {
  margin-top: 34rpx;
}
.section-title {
  color: #25302a;
  font-size: 29rpx;
  font-weight: 650;
}
.long-text {
  margin-top: 14rpx;
  color: #434d48;
  font-size: 27rpx;
  line-height: 1.8;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.reply {
  padding: 24rpx;
  background: #edf6f2;
  border-left: 4px solid #23744f;
}
.timeline {
  margin-top: 28rpx;
  padding-top: 22rpx;
  border-top: 1px solid #e6ece8;
  color: #77807b;
  font-size: 22rpx;
}
</style>
