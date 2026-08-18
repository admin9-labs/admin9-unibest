<script lang="ts" setup>
import type {
  ConsultationCategory,
  ConsultationInput,
} from '@/api/consultations'
import { reactive, ref } from 'vue'
import {
  createGuestConsultation,
  createMemberConsultation,
  getConsultationCategories,
} from '@/api/consultations'
import { useTokenStore } from '@/store/token'
import { saveConsultationCredential } from '@/utils/consultation-credential'

definePage({ style: { navigationBarTitleText: '旅游咨询' } })
const tokenStore = useTokenStore()
const categories = ref<ConsultationCategory[]>([])
const loading = ref(true)
const loadFailed = ref(false)
const submitting = ref(false)
const form = reactive<ConsultationInput>({
  category_id: 0,
  contact_name: '',
  contact_mobile: '',
  contact_email: '',
  subject: '',
  content: '',
})

async function load() {
  loading.value = true
  loadFailed.value = false
  try {
    categories.value = await getConsultationCategories()
    if (!form.category_id && categories.value.length)
      form.category_id = categories.value[0].id
  }
  catch {
    loadFailed.value = true
  }
  finally {
    loading.value = false
  }
}
function validate() {
  if (
    !form.category_id
    || !form.contact_name.trim()
    || (!form.contact_mobile?.trim() && !form.contact_email?.trim())
    || !form.subject.trim()
    || !form.content.trim()
  ) {
    uni.showToast({ icon: 'none', title: '请完整填写必填信息' })
    return false
  }
  return true
}
async function submit() {
  if (!validate() || submitting.value)
    return
  submitting.value = true
  try {
    const input = {
      ...form,
      contact_name: form.contact_name.trim(),
      contact_mobile: form.contact_mobile?.trim() || null,
      contact_email: form.contact_email?.trim() || null,
      subject: form.subject.trim(),
      content: form.content.trim(),
    }
    if (tokenStore.hasLogin) {
      const item = await createMemberConsultation(input)
      uni.redirectTo({
        url: `/pages/consultations/member-detail?ticket=${encodeURIComponent(item.ticket_no)}`,
      })
    }
    else {
      const result = await createGuestConsultation(input)
      if (!result.query_credential)
        throw new Error('未返回查询凭证')
      saveConsultationCredential({
        ticketNo: result.consultation.ticket_no,
        credential: result.query_credential,
        expiresAt: result.query_credential_expires_at,
      })
      uni.redirectTo({
        url: `/pages/consultations/receipt?ticket=${encodeURIComponent(result.consultation.ticket_no)}`,
      })
    }
  }
  catch (error) {
    uni.showToast({
      icon: 'none',
      title: (error as Error).message || '提交失败，请稍后重试',
    })
  }
  finally {
    submitting.value = false
  }
}
onLoad(load)
</script>

<template>
  <view class="page">
    <view v-if="loading" class="state">
      <wd-loading text="正在加载咨询类别" />
    </view>
    <view v-else-if="loadFailed" class="state">
      <wd-empty icon="network" tip="咨询类别暂时无法加载">
        <template #bottom>
          <wd-button size="small" @click="load">
            重新加载
          </wd-button>
        </template>
      </wd-empty>
    </view>
    <view v-else class="panel">
      <view class="heading">
        提交旅游咨询
      </view><view class="notice">
        {{
          tokenStore.hasLogin
            ? "咨询将保存到您的会员记录。"
            : "游客可提交；成功后请妥善保管查询凭证。"
        }}
      </view>
      <wd-form :model="form" layout="vertical">
        <wd-form-item title="咨询类别" required>
          <wd-radio-group v-model="form.category_id" shape="button">
            <wd-radio
              v-for="item in categories"
              :key="item.id"
              :value="item.id"
            >
              {{ item.name }}
            </wd-radio>
          </wd-radio-group>
        </wd-form-item>
        <wd-form-item title="联系人" required>
          <wd-input
            v-model="form.contact_name"
            :maxlength="100"
            placeholder="请输入联系人姓名"
          />
        </wd-form-item>
        <wd-form-item title="手机号">
          <wd-input
            v-model="form.contact_mobile"
            :maxlength="32"
            placeholder="手机号或邮箱至少填写一项"
          />
        </wd-form-item>
        <wd-form-item title="邮箱">
          <wd-input
            v-model="form.contact_email"
            :maxlength="255"
            placeholder="手机号或邮箱至少填写一项"
          />
        </wd-form-item>
        <wd-form-item title="咨询主题" required>
          <wd-input
            v-model="form.subject"
            :maxlength="200"
            placeholder="简要说明咨询事项"
          />
        </wd-form-item>
        <wd-form-item title="咨询内容" required>
          <wd-textarea
            v-model="form.content"
            :maxlength="10000"
            show-word-limit
            placeholder="请描述您想了解的内容"
          />
        </wd-form-item>
        <wd-button block size="large" :loading="submitting" @click="submit">
          提交咨询
        </wd-button>
      </wd-form>
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
  min-height: 72vh;
  align-items: center;
  justify-content: center;
}
.panel {
  padding: 30rpx 24rpx;
  background: #fff;
  border: 1px solid #dbe4df;
  border-radius: 8px;
}
.heading {
  color: #17211c;
  font-size: 40rpx;
  font-weight: 700;
}
.notice {
  margin: 12rpx 0 28rpx;
  color: #69716c;
  font-size: 25rpx;
  line-height: 1.6;
}
</style>
