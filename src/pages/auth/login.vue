<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { useTokenStore } from '@/store/token'
import { navigateAfterLogin } from './navigation'

definePage({ style: { navigationBarTitleText: '登录' } })

const tokenStore = useTokenStore()
const submitting = ref(false)
const redirect = ref<string>()
const form = reactive({ account: '', password: '' })

onLoad((query) => {
  redirect.value = typeof query?.redirect === 'string' ? query.redirect : undefined
})

async function submit() {
  if (!form.account.trim() || !form.password) {
    uni.showToast({ icon: 'none', title: '请输入账号和密码' })
    return
  }
  submitting.value = true
  try {
    await tokenStore.login({ account: form.account.trim(), password: form.password })
    uni.showToast({ icon: 'success', title: '登录成功' })
    navigateAfterLogin(redirect.value)
  }
  catch {
    // The HTTP layer owns user-facing request errors.
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <view class="login-page">
    <view class="login-panel">
      <view class="login-title">
        会员登录
      </view>
      <wd-form :model="form" layout="vertical">
        <wd-form-item title="邮箱或手机号" prop="account" required>
          <wd-input v-model="form.account" clearable placeholder="请输入邮箱或手机号" />
        </wd-form-item>
        <wd-form-item title="密码" prop="password" required>
          <wd-input v-model="form.password" show-password clearable placeholder="请输入密码" />
        </wd-form-item>
        <view class="actions">
          <wd-button block size="large" :loading="submitting" @click="submit">
            登录
          </wd-button>
        </view>
      </wd-form>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  padding: 96rpx 32rpx 32rpx;
  background: #f5f7fa;
  box-sizing: border-box;
}
.login-panel {
  max-width: 720rpx;
  margin: 0 auto;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}
.login-title {
  padding: 40rpx 32rpx 20rpx;
  color: #1f2329;
  font-size: 48rpx;
  font-weight: 600;
}
.actions {
  padding: 40rpx 32rpx;
}
</style>
