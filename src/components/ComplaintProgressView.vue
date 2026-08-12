<script lang="ts" setup>
import type { Complaint } from '@/api/complaints'
import { complaintStatus, formatComplaintTime } from '@/utils/complaint'

defineProps<{ item: Complaint, member?: boolean }>()
</script>

<template>
  <view class="content">
    <view class="heading">
      <view class="title">
        {{ item.title }}
      </view>
      <wd-tag :type="complaintStatus[item.status].type">
        {{ complaintStatus[item.status].label }}
      </wd-tag>
    </view>
    <view class="ticket">
      {{ item.ticket_no }} · {{ item.category?.name || '旅游投诉' }}
    </view>
    <view v-if="member && item.contact" class="contact">
      <view>{{ item.contact.name }}</view><view v-if="item.contact.mobile">
        {{ item.contact.mobile }}
      </view><view v-if="item.contact.email">
        {{ item.contact.email }}
      </view>
    </view>
    <view class="section">
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
    <view class="timeline">
      <view>提交时间 {{ formatComplaintTime(item.created_at) }}</view>
      <view v-if="item.accepted_at">
        受理时间 {{ formatComplaintTime(item.accepted_at) }}
      </view>
      <view v-if="item.resolved_at">
        处理时间 {{ formatComplaintTime(item.resolved_at) }}
      </view>
      <view v-if="item.closed_at">
        关闭时间 {{ formatComplaintTime(item.closed_at) }}
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
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
.resolution {
  padding: 24rpx;
  background: #edf6f2;
  border-left: 4px solid #23744f;
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
.timeline {
  margin-top: 28rpx;
  padding-top: 22rpx;
  border-top: 1px solid #e6ece8;
  color: #77807b;
  font-size: 22rpx;
  line-height: 1.8;
}
</style>
