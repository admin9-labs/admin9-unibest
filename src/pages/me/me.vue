<script lang="ts" setup>
import type { PasswordChange } from '@/api/member'
import { storeToRefs } from 'pinia'
import { reactive, ref } from 'vue'
import { getSessionGeneration, isSessionGenerationCurrent } from '@/http/session'
import { LOGIN_PAGE } from '@/router/config'
import { useTokenStore } from '@/store/token'
import { useUserStore } from '@/store/user'

definePage({ excludeLoginPath: true, style: { navigationBarTitleText: '会员中心' } })

const tokenStore = useTokenStore()
const userStore = useUserStore()
const { member } = storeToRefs(userStore)
const saving = ref(false)
const loadingMember = ref(false)
const memberLoadFailed = ref(false)
const password = reactive<PasswordChange>({ current_password: '', password: '', password_confirmation: '' })

async function loadMember() {
  if (!tokenStore.hasLogin)
    return
  const generation = getSessionGeneration()
  loadingMember.value = true
  memberLoadFailed.value = false
  try {
    await userStore.fetchMember()
  }
  catch {
    if (isSessionGenerationCurrent(generation) && tokenStore.hasLogin)
      memberLoadFailed.value = true
  }
  finally {
    if (isSessionGenerationCurrent(generation))
      loadingMember.value = false
  }
}

onShow(loadMember)

function login() {
  uni.navigateTo({ url: LOGIN_PAGE })
}

async function submitPassword() {
  if (!password.current_password || password.password.length < 8 || password.password !== password.password_confirmation) {
    uni.showToast({ icon: 'none', title: '请检查密码填写，且新密码至少 8 位' })
    return
  }
  saving.value = true
  try {
    const changedCurrentSession = await tokenStore.changePassword(password)
    if (!changedCurrentSession)
      return
    password.current_password = ''
    password.password = ''
    password.password_confirmation = ''
    uni.showToast({ icon: 'success', title: '密码已更新，请重新登录' })
    uni.reLaunch({ url: LOGIN_PAGE })
  }
  catch {
    // The HTTP layer owns user-facing request errors.
  }
  finally {
    saving.value = false
  }
}

function confirmLogout() {
  uni.showModal({
    title: '退出登录',
    content: '确定退出当前账号？',
    success: async ({ confirm }) => {
      if (!confirm)
        return
      try {
        const loggedOutCurrentSession = await tokenStore.logout()
        if (loggedOutCurrentSession)
          uni.showToast({ icon: 'success', title: '已退出登录' })
      }
      catch {
        // Local cleanup still runs in the store; HTTP owns the error toast.
      }
    },
  })
}
</script>

<template>
  <view class="member-page">
    <template v-if="tokenStore.hasLogin">
      <template v-if="member">
        <view class="identity">
          <view class="member-name">
            {{ member.name || member.email || member.mobile }}
          </view>
          <wd-tag :type="member.is_active ? 'success' : 'danger'">
            {{ member.is_active ? '正常' : '停用' }}
          </wd-tag>
        </view>
        <wd-cell-group border title="账号信息">
          <wd-cell title="会员 ID" :value="String(member.id)" />
          <wd-cell title="姓名" :value="member.name || '-'" />
          <wd-cell title="邮箱" :value="member.email || '-'" />
          <wd-cell title="手机号" :value="member.mobile || '-'" />
          <wd-cell title="最后登录" :value="member.last_login_at || '-'" />
        </wd-cell-group>
        <view class="section-title">
          修改密码
        </view>
        <wd-form :model="password" layout="vertical">
          <wd-form-item title="当前密码" prop="current_password" required>
            <wd-input v-model="password.current_password" show-password clearable />
          </wd-form-item>
          <wd-form-item title="新密码" prop="password" required>
            <wd-input v-model="password.password" show-password clearable />
          </wd-form-item>
          <wd-form-item title="确认新密码" prop="password_confirmation" required>
            <wd-input v-model="password.password_confirmation" show-password clearable />
          </wd-form-item>
          <view class="actions">
            <wd-button block :loading="saving" @click="submitPassword">
              更新密码
            </wd-button>
          </view>
        </wd-form>
        <view class="actions">
          <wd-button type="danger" plain block @click="confirmLogout">
            退出登录
          </wd-button>
        </view>
      </template>
      <view v-else class="profile-state">
        <view v-if="loadingMember" class="profile-state__text">
          正在加载会员资料...
        </view>
        <template v-else>
          <view class="profile-state__text">
            {{ memberLoadFailed ? '会员资料暂时无法加载' : '会员资料尚未加载' }}
          </view>
          <wd-button plain block @click="loadMember">
            重新加载
          </wd-button>
        </template>
      </view>
    </template>
    <view v-else class="signed-out">
      <wd-button block size="large" @click="login">
        登录
      </wd-button>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.member-page {
  min-height: 100vh;
  padding: 24rpx;
  background: #f5f7fa;
  box-sizing: border-box;
}
.identity {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 36rpx 32rpx;
  background: #fff;
  border-radius: 8px 8px 0 0;
}
.member-name {
  min-width: 0;
  overflow-wrap: anywhere;
  color: #1f2329;
  font-size: 40rpx;
  font-weight: 600;
}
.section-title {
  padding: 40rpx 24rpx 16rpx;
  color: #646a73;
  font-size: 28rpx;
}
.actions {
  padding: 28rpx 24rpx;
}
.signed-out {
  max-width: 560rpx;
  margin: 180rpx auto 0;
}
.profile-state {
  max-width: 560rpx;
  margin: 180rpx auto 0;
}
.profile-state__text {
  margin-bottom: 28rpx;
  color: #646a73;
  text-align: center;
}
</style>
