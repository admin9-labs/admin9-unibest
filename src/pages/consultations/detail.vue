<script lang="ts" setup>
import type { Consultation } from '@/api/consultations'
import type { HttpError } from '@/http/types'
import { ref } from 'vue'
import { queryGuestConsultation } from '@/api/consultations'
import {
  consultationStatus,
  formatConsultationTime,
} from '@/utils/consultation'
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
    <view v-if="loading" class="state">
      <wd-loading text="正在查询咨询进度" />
    </view><view v-else-if="missing" class="state">
      <wd-empty tip="当前设备没有有效凭证，或该工单已失效">
        <template #bottom>
          <wd-button
            size="small"
            @click="manualQuery"
          >
            输入凭证查询
          </wd-button>
        </template>
      </wd-empty>
    </view><view v-else-if="failed" class="state">
      <wd-empty icon="network" tip="咨询进度暂时无法加载">
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
        工单号 {{ item.ticket_no }}
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
        </view><view class="time">
          回复时间 {{ formatConsultationTime(item.replied_at) }}
        </view>
      </view><view v-if="item.close_reason" class="section">
        <view class="section-title">
          关闭说明
        </view><view class="long-text">
          {{ item.close_reason }}
        </view>
      </view><view class="timeline">
        <view>提交时间 {{ formatConsultationTime(item.created_at) }}</view><view v-if="item.accepted_at">
          受理时间 {{ formatConsultationTime(item.accepted_at) }}
        </view><view v-if="item.closed_at">
          关闭时间 {{ formatConsultationTime(item.closed_at) }}
        </view>
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
.time,
.timeline {
  margin-top: 15rpx;
  color: #77807b;
  font-size: 22rpx;
  line-height: 1.8;
}
.timeline {
  padding-top: 24rpx;
  border-top: 1px solid #e6ece8;
}
</style>
