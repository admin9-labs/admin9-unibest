<script lang="ts" setup>
import type { Consultation } from '@/api/consultations'
import { computed } from 'vue'
import { consultationStatus, formatConsultationTime } from '@/utils/consultation'
import WorkOrderProgress from './WorkOrderProgress.vue'

const props = defineProps<{ item: Consultation, member?: boolean }>()

const statusPresentation = computed(() => ({
  pending: { hint: '咨询已收到，等待受理。', tone: 'pending' as const },
  processing: { hint: '咨询已受理，正在办理。', tone: 'active' as const },
  replied: { hint: '办理回复已经形成。', tone: 'complete' as const },
  closed: { hint: '该咨询流程已关闭。', tone: 'closed' as const },
}[props.item.status]))

const events = computed(() => [
  { label: '已提交', value: props.item.created_at },
  { label: '已受理', value: props.item.accepted_at },
  { label: '已回复', value: props.item.replied_at },
  { label: '已关闭', value: props.item.closed_at },
].filter((event): event is { label: string, value: string } => Boolean(event.value)).map(event => ({ label: event.label, time: formatConsultationTime(event.value) })))
</script>

<template>
  <view class="consultation-progress">
    <WorkOrderProgress :label="consultationStatus[item.status].label" :hint="statusPresentation.hint" :tone="statusPresentation.tone" :events="events" />
    <view class="heading">
      <view class="title">
        {{ item.subject }}
      </view>
      <view class="ticket">
        {{ item.ticket_no }}<template v-if="item.category?.name">
          · {{ item.category.name }}
        </template>
      </view>
    </view>
    <view v-if="item.reply_content" class="section response">
      <view class="section-title">
        办理回复
      </view><view class="long-text">
        {{ item.reply_content }}
      </view>
    </view>
    <view v-if="item.close_reason" class="section close-reason">
      <view class="section-title">
        关闭说明
      </view><view class="long-text">
        {{ item.close_reason }}
      </view>
    </view>
    <view class="section">
      <view class="section-title">
        咨询内容
      </view><view class="long-text">
        {{ item.content }}
      </view>
    </view>
    <view v-if="member && item.contact" class="section contact">
      <view class="section-title">
        联系信息
      </view>
      <view class="contact-lines">
        <view>{{ item.contact.name }}</view><view v-if="item.contact.mobile">
          {{ item.contact.mobile }}
        </view><view v-if="item.contact.email">
          {{ item.contact.email }}
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.consultation-progress {
  width: 100%;
}
.heading {
  margin-top: 38rpx;
}
.title {
  color: var(--lx-color-text-main);
  font-size: 36rpx;
  font-weight: 700;
  line-height: 1.4;
  overflow-wrap: anywhere;
}
.ticket {
  margin-top: 10rpx;
  color: var(--lx-color-text-tertiary);
  font-size: 22rpx;
  line-height: 1.5;
  overflow-wrap: anywhere;
}
.section {
  margin-top: 38rpx;
}
.section-title {
  color: var(--lx-color-text-main);
  font-size: 28rpx;
  font-weight: 650;
}
.long-text {
  margin-top: 13rpx;
  color: var(--lx-color-text-secondary);
  font-size: 26rpx;
  line-height: 1.78;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.response {
  padding: 24rpx;
  background: var(--lx-color-surface-lake);
  border-left: 4rpx solid var(--lx-color-status-success);
}
.close-reason {
  padding-top: 24rpx;
  border-top: 1px solid var(--lx-color-border);
}
.contact {
  padding-top: 24rpx;
  border-top: 1px solid var(--lx-color-border);
}
.contact-lines {
  margin-top: 12rpx;
  color: var(--lx-color-text-secondary);
  font-size: 24rpx;
  line-height: 1.75;
  overflow-wrap: anywhere;
}
</style>
