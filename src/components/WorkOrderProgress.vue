<script lang="ts" setup>
withDefaults(defineProps<{
  events: Array<{ label: string, time: string }>
  hint: string
  label: string
  tone?: 'pending' | 'active' | 'complete' | 'closed'
}>(), {
  tone: 'active',
})
</script>

<template>
  <view class="work-order-progress" :class="`work-order-progress--${tone}`">
    <view class="work-order-progress__current">
      <view class="work-order-progress__caption">
        当前进度
      </view>
      <view class="work-order-progress__label">
        {{ label }}
      </view>
      <view class="work-order-progress__hint">
        {{ hint }}
      </view>
    </view>
    <view v-if="events.length" class="work-order-progress__events">
      <view v-for="event in events" :key="`${event.label}-${event.time}`" class="work-order-progress__event">
        <view class="work-order-progress__dot" />
        <view class="work-order-progress__event-copy">
          <text>{{ event.label }}</text><text>{{ event.time }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.work-order-progress {
  padding: 0 0 30rpx;
  border-bottom: 1px solid var(--lx-color-border-strong);
}
.work-order-progress__current {
  padding-left: 20rpx;
  border-left: 5rpx solid var(--lx-color-status-info);
}
.work-order-progress--pending .work-order-progress__current {
  border-left-color: var(--lx-color-status-warning);
}
.work-order-progress--complete .work-order-progress__current {
  border-left-color: var(--lx-color-status-success);
}
.work-order-progress--closed .work-order-progress__current {
  border-left-color: var(--lx-color-text-tertiary);
}
.work-order-progress__caption {
  color: var(--lx-color-text-tertiary);
  font-size: 21rpx;
  line-height: 1.4;
}
.work-order-progress__label {
  margin-top: 6rpx;
  color: var(--lx-color-text-main);
  font-size: 38rpx;
  font-weight: 700;
  line-height: 1.35;
}
.work-order-progress__hint {
  margin-top: 8rpx;
  color: var(--lx-color-text-secondary);
  font-size: 25rpx;
  line-height: 1.6;
}
.work-order-progress__events {
  margin-top: 28rpx;
}
.work-order-progress__event {
  position: relative;
  display: grid;
  grid-template-columns: 20rpx minmax(0, 1fr);
  gap: 14rpx;
  min-height: 52rpx;
}
.work-order-progress__event:not(:last-child)::after {
  position: absolute;
  top: 18rpx;
  bottom: -2rpx;
  left: 7rpx;
  width: 2rpx;
  background: var(--lx-color-border-strong);
  content: '';
}
.work-order-progress__dot {
  z-index: 1;
  width: 14rpx;
  height: 14rpx;
  margin-top: 5rpx;
  background: var(--lx-color-surface);
  border: 4rpx solid var(--lx-color-primary);
  border-radius: 50%;
  box-sizing: border-box;
}
.work-order-progress__event-copy {
  display: flex;
  min-width: 0;
  justify-content: space-between;
  gap: 20rpx;
  padding-bottom: 16rpx;
  color: var(--lx-color-text-secondary);
  font-size: 23rpx;
  line-height: 1.45;
}
.work-order-progress__event-copy text:last-child {
  color: var(--lx-color-text-tertiary);
  text-align: right;
  overflow-wrap: anywhere;
}
</style>
