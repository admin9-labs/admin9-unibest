<script lang="ts" setup>
defineProps<{
  credential: string
  ticket: string
  title: string
}>()

defineEmits<{
  copy: [value: string]
  view: []
}>()
</script>

<template>
  <view class="work-order-receipt">
    <view class="work-order-receipt__success">
      <wd-icon name="check-circle" size="34" color="var(--lx-color-status-success)" />
      <view>
        <view class="work-order-receipt__title">
          {{ title }}
        </view>
        <view class="work-order-receipt__next">
          请保存以下信息，用于后续查询办理进度。
        </view>
      </view>
    </view>
    <view class="work-order-receipt__notice">
      查询凭证仅用于查看此工单，请勿转发给他人。凭证不会出现在分享链接中。
    </view>
    <view class="work-order-receipt__fields">
      <view class="work-order-receipt__field">
        <view class="work-order-receipt__field-head">
          <text>工单号</text><wd-button size="small" variant="text" icon="copy" @click="$emit('copy', ticket)">
            复制
          </wd-button>
        </view>
        <view class="work-order-receipt__value">
          {{ ticket }}
        </view>
      </view>
      <view class="work-order-receipt__field">
        <view class="work-order-receipt__field-head">
          <text>查询凭证</text><wd-button size="small" variant="text" icon="copy" @click="$emit('copy', credential)">
            复制
          </wd-button>
        </view>
        <view class="work-order-receipt__value work-order-receipt__credential">
          {{ credential }}
        </view>
      </view>
    </view>
    <wd-button block size="large" @click="$emit('view')">
      查看办理进度
    </wd-button>
  </view>
</template>

<style lang="scss" scoped>
.work-order-receipt {
  width: 100%;
}
.work-order-receipt__success {
  display: flex;
  align-items: flex-start;
  gap: 18rpx;
  padding-bottom: 30rpx;
  border-bottom: 1px solid var(--lx-color-border-strong);
}
.work-order-receipt__title {
  color: var(--lx-color-text-main);
  font-size: 38rpx;
  font-weight: 700;
  line-height: 1.35;
}
.work-order-receipt__next {
  margin-top: 8rpx;
  color: var(--lx-color-text-secondary);
  font-size: 24rpx;
  line-height: 1.6;
}
.work-order-receipt__notice {
  margin-top: 26rpx;
  padding: 18rpx 20rpx;
  color: var(--lx-color-status-warning);
  background: var(--lx-color-surface-warm);
  border-left: 4rpx solid #deb458;
  font-size: 23rpx;
  line-height: 1.6;
}
.work-order-receipt__fields {
  margin: 34rpx 0;
  border-top: 1px solid var(--lx-color-border-strong);
}
.work-order-receipt__field {
  padding: 22rpx 0;
  border-bottom: 1px solid var(--lx-color-border);
}
.work-order-receipt__field-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--lx-color-text-tertiary);
  font-size: 23rpx;
}
.work-order-receipt__value {
  margin-top: 8rpx;
  color: var(--lx-color-text-main);
  font-size: 28rpx;
  line-height: 1.55;
  overflow-wrap: anywhere;
  word-break: break-all;
}
.work-order-receipt__credential {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 22rpx;
  letter-spacing: 0;
}
</style>
