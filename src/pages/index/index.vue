<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useTokenStore } from '@/store/token'
import { useUserStore } from '@/store/user'

defineOptions({ name: 'Home' })
definePage({ type: 'home', style: { navigationBarTitleText: '首页' } })

const tokenStore = useTokenStore()
const userStore = useUserStore()
const { member } = storeToRefs(userStore)

function openMemberCenter() {
  uni.switchTab({ url: '/pages/me/me' })
}
</script>

<template>
  <view class="home-page">
    <view class="home-header">
      <view class="home-title">
        会员服务
      </view>
      <view class="home-status">
        {{ tokenStore.hasLogin ? (member?.name || member?.email || member?.mobile || '已登录') : '未登录' }}
      </view>
    </view>
    <wd-cell-group border>
      <wd-cell title="账号中心" label="查看会员资料与账号安全" is-link @click="openMemberCenter" />
    </wd-cell-group>
  </view>
</template>

<style lang="scss" scoped>
.home-page {
  min-height: 100vh;
  padding: 32rpx 24rpx;
  background: #f5f7fa;
  box-sizing: border-box;
}

.home-header {
  padding: 48rpx 32rpx;
  background: #fff;
  border-bottom: 1px solid #e5e6eb;
  border-radius: 8px 8px 0 0;
}

.home-title {
  color: #1f2329;
  font-size: 44rpx;
  font-weight: 600;
}

.home-status {
  margin-top: 12rpx;
  color: #646a73;
  font-size: 28rpx;
  overflow-wrap: anywhere;
}
</style>
