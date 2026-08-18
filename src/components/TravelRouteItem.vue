<script lang="ts" setup>
withDefaults(defineProps<{
  duration?: string
  imageUrl?: null | string
  summary?: null | string
  title: string
}>(), {
  duration: '',
  imageUrl: '',
  summary: '',
})

defineEmits<{ click: [] }>()
</script>

<template>
  <view class="route-item" role="link" hover-class="route-item--pressed" @click="$emit('click')">
    <view class="route-item__media">
      <wd-img v-if="imageUrl" :src="imageUrl" width="100%" height="100%" mode="aspectFill" radius="0" lazy-load>
        <template #loading>
          <view class="route-item__placeholder">
            <wd-loading />
          </view>
        </template>
        <template #error>
          <view class="route-item__placeholder">
            <wd-icon name="image" size="28" /><text>暂无图片</text>
          </view>
        </template>
      </wd-img>
      <view v-else class="route-item__placeholder">
        <wd-icon name="image" size="28" /><text>暂无图片</text>
      </view>
      <view v-if="duration" class="route-item__duration">
        <wd-icon name="clock-circle" size="14" /><text>{{ duration }}</text>
      </view>
    </view>
    <view class="route-item__body">
      <view class="route-item__title">
        {{ title }}
      </view>
      <view v-if="summary" class="route-item__summary">
        {{ summary }}
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.route-item {
  min-width: 0;
  padding-bottom: 28rpx;
  border-bottom: 1px solid var(--lx-color-border);
}
.route-item--pressed {
  opacity: 0.82;
}
.route-item__media {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: #e5ecea;
  border-radius: var(--lx-radius-media);
}
.route-item__placeholder {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  color: var(--lx-color-text-tertiary);
  font-size: 21rpx;
}
.route-item__duration {
  position: absolute;
  right: 16rpx;
  bottom: 16rpx;
  display: flex;
  align-items: center;
  gap: 7rpx;
  padding: 9rpx 13rpx;
  color: #fff;
  background: rgb(12 34 32 / 78%);
  border-radius: 4px;
  font-size: 21rpx;
  line-height: 1;
}
.route-item__body {
  padding-top: 20rpx;
}
.route-item__title {
  color: var(--lx-color-text-main);
  font-size: 33rpx;
  font-weight: 680;
  line-height: 1.4;
  overflow-wrap: anywhere;
}
.route-item__summary {
  display: -webkit-box;
  margin-top: 9rpx;
  overflow: hidden;
  color: var(--lx-color-text-secondary);
  font-size: 25rpx;
  line-height: 1.6;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
</style>
