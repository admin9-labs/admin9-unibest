<script lang="ts" setup>
import type { Complaint } from '@/api/complaints'
import { ref } from 'vue'
import { getMemberComplaints } from '@/api/complaints'
import PublicState from '@/components/PublicState.vue'
import { complaintStatus, formatComplaintTime } from '@/utils/complaint'

definePage({ excludeLoginPath: true, style: { navigationBarTitleText: '我的投诉' } })
const items = ref<Complaint[]>([])
const loading = ref(true)
const failed = ref(false)
async function load() {
  loading.value = true
  failed.value = false
  try {
    items.value = await getMemberComplaints()
  }
  catch {
    failed.value = true
  }
  finally {
    loading.value = false
  }
}
function open(ticket: string) {
  uni.navigateTo({ url: `/pages/complaints/member-detail?ticket=${encodeURIComponent(ticket)}` })
}
function create() {
  uni.navigateTo({ url: '/pages/complaints/submit' })
}
onLoad(load)
</script>

<template>
  <view class="page">
    <view class="toolbar">
      <view class="record-count">
        {{ loading ? '' : `${items.length} 条记录` }}
      </view>
      <wd-button size="small" @click="create">
        新建投诉
      </wd-button>
    </view>
    <view v-if="loading" class="state">
      <PublicState kind="loading" title="正在加载投诉记录" />
    </view>
    <view v-else-if="failed" class="state">
      <PublicState kind="network-error" title="投诉记录暂时无法加载" description="请检查网络后重新尝试。" action-text="重新加载" @action="load" />
    </view>
    <view v-else-if="!items.length" class="state">
      <PublicState kind="initial-empty" title="暂无投诉记录" action-text="提交投诉" @action="create" />
    </view>
    <view v-else class="list">
      <view v-for="item in items" :key="item.ticket_no" class="record" role="link" @click="open(item.ticket_no)">
        <view class="record-heading">
          <view class="record-title">
            {{ item.title }}
          </view><wd-tag :type="complaintStatus[item.status].type">
            {{ complaintStatus[item.status].label }}
          </wd-tag>
        </view><view class="target">
          {{ item.target_name }}
        </view><view class="meta">
          {{ item.ticket_no }} · {{ formatComplaintTime(item.created_at) }}
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  max-width: var(--lx-page-max);
  margin: 0 auto;
  padding: 0 var(--lx-space-page) calc(40rpx + env(safe-area-inset-bottom));
  background: var(--lx-color-surface-muted);
  box-sizing: border-box;
}
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 100rpx;
  gap: 20rpx;
  border-bottom: 1px solid var(--lx-color-border);
}
.record-count,
.meta,
.target {
  color: var(--lx-color-text-tertiary);
  font-size: 23rpx;
}
.state {
  min-height: 68vh;
}
.list {
  background: var(--lx-color-surface);
}
.record {
  padding: 28rpx 4rpx;
  border-bottom: 1px solid var(--lx-color-border);
  transition: opacity 120ms ease;
}
.record:active {
  opacity: 0.58;
}
.record-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
}
.record-title {
  min-width: 0;
  color: var(--lx-color-text-main);
  font-size: 31rpx;
  font-weight: 650;
  line-height: 1.45;
  overflow-wrap: anywhere;
}
.target {
  margin-top: 12rpx;
  line-height: 1.5;
  overflow-wrap: anywhere;
}
.meta {
  margin-top: 14rpx;
  line-height: 1.5;
  overflow-wrap: anywhere;
}
</style>
