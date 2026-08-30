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
    <view class="page-shell">
      <view class="service-section">
        <view class="section-title">
          旅游投诉
        </view>
        <view class="entry-list">
          <view class="entry" role="link" hover-class="entry--pressed" @click="open('/pages/complaints/submit')">
            <view>
              <view class="entry-title">
                提交旅游投诉
              </view><view class="entry-copy">
                游客无需登录，可上传图片凭证
              </view>
            </view>
          </view>
          <view class="entry" role="link" hover-class="entry--pressed" @click="open('/pages/complaints/query')">
            <view>
              <view class="entry-title">
                查询投诉进度
              </view><view class="entry-copy">
                使用工单号与安全查询凭证
              </view>
            </view>
          </view>
          <view class="entry" role="link" hover-class="entry--pressed" @click="open('/pages/complaints/member-list')">
            <view>
              <view class="entry-title">
                我的投诉
              </view><view class="entry-copy">
                {{ tokenStore.hasLogin ? '查看本人已提交记录' : '登录后查看本人记录' }}
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="service-section">
        <view class="section-title">
          游客服务
        </view>
        <view class="entry-list">
          <view class="entry" role="link" hover-class="entry--pressed" @click="open('/pages/services/index')">
            <view>
              <view class="entry-title">
                服务信息
              </view><view class="entry-copy">
                游客中心、交通与便民服务
              </view>
            </view>
          </view>
          <view class="entry" role="link" hover-class="entry--pressed" @click="open('/pages/parking-facilities/index')">
            <view>
              <view class="entry-title">
                停车设施
              </view><view class="entry-copy">
                停车场、停车点与地图导航
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="service-section">
        <view class="section-title">
          旅游咨询
        </view>
        <view class="entry-list">
          <view class="entry" role="link" hover-class="entry--pressed" @click="open('/pages/consultations/submit')">
            <view>
              <view class="entry-title">
                提交旅游咨询
              </view><view class="entry-copy">
                游客无需登录即可提交
              </view>
            </view>
          </view>
          <view class="entry" role="link" hover-class="entry--pressed" @click="open('/pages/consultations/query')">
            <view>
              <view class="entry-title">
                查询咨询进度
              </view><view class="entry-copy">
                使用工单号与安全查询凭证
              </view>
            </view>
          </view>
          <view class="entry" role="link" hover-class="entry--pressed" @click="open('/pages/consultations/member-list')">
            <view>
              <view class="entry-title">
                我的咨询
              </view><view class="entry-copy">
                {{ tokenStore.hasLogin ? '查看本人已提交记录' : '登录后查看本人记录' }}
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: var(--lx-color-surface-muted);
}
.page-shell {
  width: 100%;
  max-width: 520px;
  min-height: 100vh;
  margin: 0 auto;
  padding: 32rpx 28rpx calc(56rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}
.service-section + .service-section {
  margin-top: 34rpx;
}
.section-title {
  margin-bottom: 14rpx;
  color: var(--lx-color-text-secondary);
  font-size: 24rpx;
  font-weight: 600;
}
.entry-list {
  overflow: hidden;
  background: var(--lx-color-surface);
  border: 1px solid var(--lx-color-border);
  border-radius: var(--lx-radius-card);
}
.entry {
  display: block;
  min-height: 118rpx;
  padding: 22rpx 24rpx;
  box-sizing: border-box;
}
.entry + .entry {
  border-top: 1px solid var(--lx-color-border);
}
.entry--pressed {
  background: var(--lx-color-surface-pressed);
}
.entry-title {
  color: var(--lx-color-text-main);
  font-size: 29rpx;
  font-weight: 650;
  line-height: 1.4;
  overflow-wrap: anywhere;
}
.entry-copy {
  margin-top: 5rpx;
  color: var(--lx-color-text-tertiary);
  font-size: 23rpx;
  line-height: 1.5;
  overflow-wrap: anywhere;
}
</style>
