<script lang="ts" setup>
import type { Consultation } from '@/api/consultations'
import { ref } from 'vue'
import { getMemberConsultations } from '@/api/consultations'
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
    <view class="header">
      <view class="title">
        我的咨询
      </view><wd-button
        size="small"
        @click="create"
      >
        新增咨询
      </wd-button>
    </view><view v-if="loading" class="state">
      <wd-loading text="正在加载本人记录" />
    </view><view v-else-if="failed" class="state">
      <wd-empty icon="network" tip="本人咨询暂时无法加载">
        <template #bottom>
          <wd-button size="small" @click="load">
            重新加载
          </wd-button>
        </template>
      </wd-empty>
    </view><view v-else-if="!items.length" class="state">
      <wd-empty tip="暂无咨询记录" />
    </view><view v-else class="list">
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
  padding: 28rpx;
  background: #f4f6f3;
  box-sizing: border-box;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 4rpx 32rpx;
}
.title {
  color: #17211c;
  font-size: 42rpx;
  font-weight: 700;
}
.state {
  display: flex;
  min-height: 60vh;
  align-items: center;
  justify-content: center;
}
.list {
  display: grid;
  gap: 20rpx;
}
.record {
  padding: 26rpx;
  background: #fff;
  border: 1px solid #dbe4df;
  border-radius: 8px;
}
.record-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
}
.subject {
  min-width: 0;
  color: #17211c;
  font-size: 30rpx;
  font-weight: 650;
  overflow-wrap: anywhere;
}
.meta {
  margin-top: 10rpx;
  color: #69716c;
  font-size: 22rpx;
}
</style>
