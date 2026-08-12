<script lang="ts" setup>
import type { Complaint } from '@/api/complaints'
import { ref } from 'vue'
import { getMemberComplaints } from '@/api/complaints'
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
      <view>
        <view class="title">
          我的投诉
        </view><view class="copy">
          仅显示当前会员本人提交的记录
        </view>
      </view><wd-button size="small" @click="create">
        新建投诉
      </wd-button>
    </view><view v-if="loading" class="state">
      <wd-loading text="正在加载投诉记录" />
    </view><view v-else-if="failed" class="state">
      <wd-empty icon="network" tip="投诉记录暂时无法加载">
        <template #bottom>
          <wd-button size="small" @click="load">
            重新加载
          </wd-button>
        </template>
      </wd-empty>
    </view><view v-else-if="!items.length" class="state">
      <wd-empty tip="暂无投诉记录">
        <template #bottom>
          <wd-button size="small" @click="create">
            提交投诉
          </wd-button>
        </template>
      </wd-empty>
    </view><view v-else class="list">
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
  padding: 28rpx;
  background: #f4f6f3;
  box-sizing: border-box;
}
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
  padding: 14rpx 4rpx 30rpx;
}
.title {
  color: #17211c;
  font-size: 42rpx;
  font-weight: 700;
}
.copy,
.meta,
.target {
  color: #69716c;
  font-size: 23rpx;
}
.copy {
  margin-top: 8rpx;
}
.state {
  display: flex;
  min-height: 65vh;
  align-items: center;
  justify-content: center;
}
.record {
  padding: 26rpx;
  background: #fff;
  border: 1px solid #dbe4df;
  border-radius: 8px;
}
.record + .record {
  margin-top: 18rpx;
}
.record-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
}
.record-title {
  min-width: 0;
  color: #17211c;
  font-size: 31rpx;
  font-weight: 650;
  overflow-wrap: anywhere;
}
.target {
  margin-top: 12rpx;
}
.meta {
  margin-top: 14rpx;
}
</style>
