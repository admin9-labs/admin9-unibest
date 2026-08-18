<script lang="ts" setup>
import type { ComplaintCategory, ComplaintInput } from '@/api/complaints'
import { reactive, ref } from 'vue'
import { createGuestComplaint, createMemberComplaint, getComplaintCategories, uploadComplaintEvidence } from '@/api/complaints'
import { useTokenStore } from '@/store/token'
import { saveComplaintCredential } from '@/utils/complaint-credential'

definePage({ style: { navigationBarTitleText: '旅游投诉' } })
interface PendingEvidence { path: string, name: string, file: File | null, uploading: boolean, fileId?: number, uploadToken?: string }
const tokenStore = useTokenStore()
const categories = ref<ComplaintCategory[]>([])
const loading = ref(true)
const loadFailed = ref(false)
const submitting = ref(false)
const evidence = ref<PendingEvidence[]>([])
const form = reactive<ComplaintInput>({ category_id: 0, contact_name: '', contact_mobile: '', contact_email: '', target_type: null, target_name: '', title: '', content: '' })

async function load() {
  loading.value = true
  loadFailed.value = false
  try {
    categories.value = await getComplaintCategories()
    if (!form.category_id && categories.value.length)
      form.category_id = categories.value[0].id
  }
  catch { loadFailed.value = true }
  finally { loading.value = false }
}
function chooseEvidence() {
  uni.chooseImage({
    count: 6 - evidence.value.length,
    sizeType: ['compressed'],
    success(result) {
      const files = result.tempFiles as unknown as Array<{ path: string, name?: string, file?: File }>
      evidence.value.push(...files.map((item, index) => ({ path: item.path, name: item.name || `投诉凭证${evidence.value.length + index + 1}.jpg`, file: item.file || null, uploading: false })))
    },
  })
}
function removeEvidence(index: number) {
  evidence.value.splice(index, 1)
}
async function uploadPendingEvidence() {
  for (const item of evidence.value) {
    if (item.fileId && item.uploadToken)
      continue
    if (!item.file)
      throw new Error('当前图片无法上传，请删除后重新选择')
    item.uploading = true
    try {
      const result = await uploadComplaintEvidence(item.file)
      item.fileId = result.evidence.id
      item.uploadToken = result.upload_token
    }
    finally { item.uploading = false }
  }
}
function validate() {
  if (!form.category_id || !form.contact_name.trim() || (!form.contact_mobile?.trim() && !form.contact_email?.trim()) || !form.target_name.trim() || !form.title.trim() || !form.content.trim()) {
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
    await uploadPendingEvidence()
    const input: ComplaintInput = {
      ...form,
      contact_name: form.contact_name.trim(),
      contact_mobile: form.contact_mobile?.trim() || null,
      contact_email: form.contact_email?.trim() || null,
      target_type: form.target_type?.trim() || null,
      target_name: form.target_name.trim(),
      title: form.title.trim(),
      content: form.content.trim(),
      evidence: evidence.value.map(item => ({ file_id: item.fileId!, upload_token: item.uploadToken! })),
    }
    if (tokenStore.hasLogin) {
      const item = await createMemberComplaint(input)
      uni.redirectTo({ url: `/pages/complaints/member-detail?ticket=${encodeURIComponent(item.ticket_no)}` })
    }
    else {
      const result = await createGuestComplaint(input)
      if (!result.query_credential)
        throw new Error('未返回查询凭证')
      saveComplaintCredential({ ticketNo: result.complaint.ticket_no, credential: result.query_credential, expiresAt: result.query_credential_expires_at })
      uni.redirectTo({ url: `/pages/complaints/receipt?ticket=${encodeURIComponent(result.complaint.ticket_no)}` })
    }
  }
  catch (error) { uni.showToast({ icon: 'none', title: (error as Error).message || '提交失败，请稍后重试' }) }
  finally { submitting.value = false }
}
onLoad(load)
</script>

<template>
  <view class="page">
    <view v-if="loading" class="state">
      <wd-loading text="正在加载投诉类别" />
    </view>
    <view v-else-if="loadFailed" class="state">
      <wd-empty icon="network" tip="投诉类别暂时无法加载">
        <template #bottom>
          <wd-button size="small" @click="load">
            重新加载
          </wd-button>
        </template>
      </wd-empty>
    </view>
    <view v-else class="panel">
      <view class="heading">
        提交旅游投诉
      </view><view class="notice">
        {{ tokenStore.hasLogin ? '投诉将保存到您的会员记录。' : '游客可提交；成功后请妥善保管查询凭证。' }}
      </view>
      <wd-form :model="form" layout="vertical">
        <wd-form-item title="投诉类别" required>
          <wd-radio-group v-model="form.category_id" shape="button">
            <wd-radio v-for="item in categories" :key="item.id" :value="item.id">
              {{ item.name }}
            </wd-radio>
          </wd-radio-group>
        </wd-form-item>
        <wd-form-item title="联系人" required>
          <wd-input v-model="form.contact_name" :maxlength="100" placeholder="请输入联系人姓名" />
        </wd-form-item>
        <wd-form-item title="手机号">
          <wd-input v-model="form.contact_mobile" :maxlength="32" placeholder="手机号或邮箱至少填写一项" />
        </wd-form-item>
        <wd-form-item title="邮箱">
          <wd-input v-model="form.contact_email" :maxlength="255" placeholder="手机号或邮箱至少填写一项" />
        </wd-form-item>
        <wd-form-item title="投诉对象" required>
          <wd-input v-model="form.target_name" :maxlength="200" placeholder="请输入场所、机构或服务名称" />
        </wd-form-item>
        <wd-form-item title="投诉主题" required>
          <wd-input v-model="form.title" :maxlength="200" placeholder="简要说明投诉事项" />
        </wd-form-item>
        <wd-form-item title="投诉内容" required>
          <wd-textarea v-model="form.content" :maxlength="10000" show-word-limit placeholder="请客观描述时间、地点和事情经过" />
        </wd-form-item>
        <wd-form-item title="图片凭证（最多 6 张）">
          <view class="evidence-grid">
            <view v-for="(item, index) in evidence" :key="item.path" class="evidence-item">
              <image :src="item.path" mode="aspectFill" /><view v-if="item.uploading" class="uploading">
                上传中
              </view><button class="remove" aria-label="删除图片" @click="removeEvidence(index)">
                ×
              </button>
            </view><button v-if="evidence.length < 6" class="add-evidence" @click="chooseEvidence">
              <wd-icon name="plus" size="24" /><text>添加图片</text>
            </button>
          </view>
        </wd-form-item>
        <wd-button block size="large" :loading="submitting" @click="submit">
          提交投诉
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
.evidence-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12rpx;
  width: 100%;
}
.evidence-item,
.add-evidence {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  padding: 0;
  overflow: hidden;
  border: 1px solid #cfdad4;
  border-radius: 6px;
}
.evidence-item image {
  width: 100%;
  height: 100%;
}
.add-evidence {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  color: #246b61;
  background: #f8faf9;
  font-size: 22rpx;
}
.remove {
  position: absolute;
  top: 6rpx;
  right: 6rpx;
  width: 42rpx;
  height: 42rpx;
  padding: 0;
  color: #fff;
  background: rgb(0 0 0 / 60%);
  border-radius: 50%;
  font-size: 32rpx;
  line-height: 40rpx;
}
.uploading {
  position: absolute;
  inset: auto 0 0;
  padding: 6rpx;
  color: #fff;
  background: rgb(0 0 0 / 60%);
  text-align: center;
  font-size: 20rpx;
}
</style>
