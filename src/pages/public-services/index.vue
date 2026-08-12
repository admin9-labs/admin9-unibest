<script lang="ts" setup>
import { useTokenStore } from '@/store/token'

definePage({ style: { navigationBarTitleText: '公共服务' } })
const tokenStore = useTokenStore()
function open(url: string) {
  uni.navigateTo({ url })
}
</script>

<template>
  <view class="page">
    <view class="intro">
      <view class="title">
        公共服务
      </view><view class="description">
        查询便民信息，提交咨询并跟进办理进度。
      </view>
    </view>
    <view class="entry" role="link" @click="open('/pages/services/index')">
      <wd-icon name="service" size="28" /><view>
        <view class="entry-title">
          服务信息
        </view><view class="entry-copy">
          游客中心、交通与便民服务
        </view>
      </view><wd-icon name="arrow-right" />
    </view>
    <view class="entry" role="link" @click="open('/pages/consultations/submit')">
      <wd-icon name="edit" size="28" /><view>
        <view class="entry-title">
          提交旅游咨询
        </view><view class="entry-copy">
          游客无需登录即可提交
        </view>
      </view><wd-icon name="arrow-right" />
    </view>
    <view class="entry" role="link" @click="open('/pages/consultations/query')">
      <wd-icon name="search" size="28" /><view>
        <view class="entry-title">
          查询咨询进度
        </view><view class="entry-copy">
          使用工单号与安全查询凭证
        </view>
      </view><wd-icon name="arrow-right" />
    </view>
    <view
      class="entry"
      role="link"
      @click="
        open(
          tokenStore.hasLogin
            ? '/pages/consultations/member-list'
            : '/pages/auth/login?redirect=%2Fpages%2Fconsultations%2Fmember-list',
        )
      "
    >
      <wd-icon name="user" size="28" /><view>
        <view class="entry-title">
          我的咨询
        </view><view class="entry-copy">
          {{
            tokenStore.hasLogin ? "查看本人已提交记录" : "登录后查看本人记录"
          }}
        </view>
      </view><wd-icon name="arrow-right" />
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
.intro {
  padding: 30rpx 4rpx 38rpx;
}
.title {
  color: #17211c;
  font-size: 44rpx;
  font-weight: 700;
}
.description {
  margin-top: 12rpx;
  color: #69716c;
  font-size: 26rpx;
}
.entry {
  display: grid;
  grid-template-columns: 64rpx 1fr 36rpx;
  align-items: center;
  gap: 16rpx;
  min-height: 126rpx;
  padding: 24rpx;
  color: #246b61;
  background: #fff;
  border: 1px solid #dbe4df;
  border-radius: 8px;
  box-sizing: border-box;
}
.entry + .entry {
  margin-top: 20rpx;
}
.entry-title {
  color: #17211c;
  font-size: 31rpx;
  font-weight: 650;
}
.entry-copy {
  margin-top: 7rpx;
  color: #69716c;
  font-size: 24rpx;
}
</style>
