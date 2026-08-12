<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { queryGuestComplaint } from '@/api/complaints'
import { saveComplaintCredential } from '@/utils/complaint-credential'

definePage({ style: { navigationBarTitleText: '查询投诉进度' } })
const submitting = ref(false)
const form = reactive({ ticketNo: '', credential: '' })
async function submit() {
  if (!form.ticketNo.trim() || !form.credential.trim()) {
    uni.showToast({ icon: 'none', title: '请输入工单号和查询凭证' })
    return
  }
  submitting.value = true
  try {
    const result = await queryGuestComplaint(form.ticketNo.trim(), form.credential.trim())
    saveComplaintCredential({ ticketNo: result.complaint.ticket_no, credential: form.credential.trim(), expiresAt: result.query_credential_expires_at })
    uni.navigateTo({ url: `/pages/complaints/detail?ticket=${encodeURIComponent(result.complaint.ticket_no)}` })
  }
  catch { uni.showToast({ icon: 'none', title: '工单不存在、凭证无效或已失效' }) }
  finally { submitting.value = false }
}
</script>

<template>
  <view class="page">
    <view class="panel">
      <view class="title">
        查询投诉进度
      </view><view class="copy">
        查询凭证不会写入 URL，也不会随页面分享。
      </view><wd-form :model="form" layout="vertical">
        <wd-form-item title="工单号" required>
          <wd-input v-model="form.ticketNo" clearable placeholder="例如 TS-20260813-XXXXXXXXXX" />
        </wd-form-item><wd-form-item title="查询凭证" required>
          <wd-textarea v-model="form.credential" :maxlength="64" placeholder="请输入 64 位查询凭证" />
        </wd-form-item><wd-button block size="large" :loading="submitting" @click="submit">
          查询
        </wd-button>
      </wd-form>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  padding: 48rpx 28rpx;
  background: #f4f6f3;
  box-sizing: border-box;
}
.panel {
  padding: 32rpx 24rpx;
  background: #fff;
  border: 1px solid #dbe4df;
  border-radius: 8px;
}
.title {
  color: #17211c;
  font-size: 40rpx;
  font-weight: 700;
}
.copy {
  margin: 12rpx 0 28rpx;
  color: #69716c;
  font-size: 25rpx;
  line-height: 1.6;
}
</style>
