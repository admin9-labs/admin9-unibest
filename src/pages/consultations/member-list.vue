<script lang="ts" setup>
import type { Consultation } from '@/api/consultations'
import { ref } from 'vue'
import { getMemberConsultations } from '@/api/consultations'
import PublicState from '@/components/PublicState.vue'
import {
  consultationStatus,
  formatConsultationTime,
} from '@/utils/consultation'

definePage({
  excludeLoginPath: true,
  style: { navigationBarTitleText: '我的咨询' },
})
const items = ref<Consultation[]>([])
const loading = ref(true)
const failed = ref(false)
async function load() {
  loading.value = true
  failed.value = false
  try {
    items.value = await getMemberConsultations()
  }
  catch {
    failed.value = true
  }
  finally {
    loading.value = false
  }
}
function open(ticket: string) {
  uni.navigateTo({
    url: `/pages/consultations/member-detail?ticket=${encodeURIComponent(ticket)}`,
  })
}
function create() {
  uni.navigateTo({ url: '/pages/consultations/submit' })
}
onShow(load)
</script>

<template>
  <view class="page">
    <view class="toolbar">
      <view class="record-count">
        {{ loading ? '' : `${items.length} 条记录` }}
      </view>
      <wd-button size="small" @click="create">
        新增咨询
      </wd-button>
    </view>
    <view v-if="loading" class="state">
      <PublicState kind="loading" title="正在加载咨询记录" />
    </view>
    <view v-else-if="failed" class="state">
      <PublicState kind="network-error" title="咨询记录暂时无法加载" description="请检查网络后重新尝试。" action-text="重新加载" @action="load" />
    </view>
    <view v-else-if="!items.length" class="state">
      <PublicState kind="initial-empty" title="暂无咨询记录" action-text="提交咨询" @action="create" />
    </view>
    <view v-else class="list">
      <view
        v-for="item in items"
        :key="item.ticket_no"
        class="record"
        role="link"
        @click="open(item.ticket_no)"
      >
        <view class="record-head">
          <view class="subject">
            {{ item.subject }}
          </view><wd-tag :type="consultationStatus[item.status].type">
            {{
              consultationStatus[item.status].label
            }}
          </wd-tag>
        </view><view class="meta">
          {{ item.ticket_no }}
        </view><view class="meta">
          {{
            formatConsultationTime(item.created_at)
          }}
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
.record-count {
  color: var(--lx-color-text-tertiary);
  font-size: var(--lx-font-meta);
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
.record-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
}
.subject {
  min-width: 0;
  color: var(--lx-color-text-main);
  font-size: 30rpx;
  font-weight: 650;
  line-height: 1.45;
  overflow-wrap: anywhere;
}
.meta {
  margin-top: 10rpx;
  color: var(--lx-color-text-tertiary);
  font-size: 22rpx;
  line-height: 1.5;
  overflow-wrap: anywhere;
}
</style>
