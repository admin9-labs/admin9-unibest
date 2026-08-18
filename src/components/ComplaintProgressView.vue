<script lang="ts" setup>
import type { Complaint } from '@/api/complaints'
import { computed } from 'vue'
import { complaintStatus, formatComplaintTime } from '@/utils/complaint'
import WorkOrderProgress from './WorkOrderProgress.vue'

const props = defineProps<{ item: Complaint, member?: boolean }>()

const statusPresentation = computed(() => ({
  pending: { hint: '投诉已收到，等待受理。', tone: 'pending' as const },
  processing: { hint: '投诉已受理，正在办理。', tone: 'active' as const },
  resolved: { hint: '处理结果已经形成。', tone: 'complete' as const },
  closed: { hint: '该投诉流程已关闭。', tone: 'closed' as const },
}[props.item.status]))

const events = computed(() => [
  { label: '已提交', value: props.item.created_at },
  { label: '已受理', value: props.item.accepted_at },
  { label: '已处理', value: props.item.resolved_at },
  { label: '已关闭', value: props.item.closed_at },
].filter((event): event is { label: string, value: string } => Boolean(event.value)).map(event => ({ label: event.label, time: formatComplaintTime(event.value) })))
</script>

<template>
  <view class="content">
    <WorkOrderProgress :label="complaintStatus[item.status].label" :hint="statusPresentation.hint" :tone="statusPresentation.tone" :events="events" />
    <view class="heading">
      <view class="title">
        {{ item.title }}
      </view>
    </view>
    <view class="ticket">
      {{ item.ticket_no }} · {{ item.category?.name || '旅游投诉' }}
    </view>
    <view v-if="item.resolution_content" class="section resolution">
      <view class="section-title">
        处理结果
      </view><view class="long-text">
        {{ item.resolution_content }}
      </view>
    </view>
    <view v-if="item.close_reason" class="section">
      <view class="section-title">
        关闭说明
      </view><view class="long-text">
        {{ item.close_reason }}
      </view>
    </view>
    <view class="section target-section">
      <view class="section-title">
        投诉对象
      </view><view class="long-text">
        {{ item.target_name }}
      </view>
    </view>
    <view class="section">
      <view class="section-title">
        投诉内容
      </view><view class="long-text">
        {{ item.content }}
      </view>
    </view>
    <view v-if="item.evidence.length" class="section">
      <view class="section-title">
        图片凭证
      </view>
      <view class="evidence">
        <image v-for="image in item.evidence" :key="image.id" :src="image.url" mode="aspectFill" />
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
.content {
  width: 100%;
}
.heading {
  margin-top: 38rpx;
}
.title {
  min-width: 0;
  color: #17211c;
  font-size: 36rpx;
  font-weight: 700;
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
.resolution {
  padding: 24rpx;
  background: var(--lx-color-surface-lake);
  border-left: 4rpx solid var(--lx-color-status-success);
}
.target-section {
  padding-top: 24rpx;
  border-top: 1px solid var(--lx-color-border);
}
.evidence {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12rpx;
  margin-top: 16rpx;
}
.evidence image {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 6px;
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
