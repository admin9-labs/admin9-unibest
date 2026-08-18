<script lang="ts" setup>
withDefaults(defineProps<{
  address?: null | string
  imageUrl?: null | string
  summary?: null | string
  title: string
}>(), {
  address: '',
  imageUrl: '',
  summary: '',
})

defineEmits<{ click: [] }>()
</script>

<template>
  <view class="destination-item" role="link" hover-class="destination-item--pressed" @click="$emit('click')">
    <view class="destination-item__media">
      <wd-img v-if="imageUrl" :src="imageUrl" width="100%" height="100%" mode="aspectFill" radius="0" lazy-load>
        <template #loading>
          <view class="destination-item__placeholder">
            <wd-loading />
          </view>
        </template>
        <template #error>
          <view class="destination-item__placeholder">
            <wd-icon name="image" size="25" /><text>暂无图片</text>
          </view>
        </template>
      </wd-img>
      <view v-else class="destination-item__placeholder">
        <wd-icon name="image" size="25" /><text>暂无图片</text>
      </view>
    </view>
    <view class="destination-item__body">
      <view class="destination-item__title">
        {{ title }}
      </view>
      <view v-if="summary" class="destination-item__summary">
        {{ summary }}
      </view>
      <view v-if="address" class="destination-item__address">
        <wd-icon name="location" size="14" /><text>{{ address }}</text>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.destination-item {
  display: grid;
  grid-template-columns: 226rpx minmax(0, 1fr);
  min-height: 188rpx;
  gap: 24rpx;
  padding: 24rpx 0;
  border-bottom: 1px solid var(--lx-color-border);
  box-sizing: border-box;
}

.destination-item--pressed {
  background: var(--lx-color-surface-pressed);
}
.destination-item__media {
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: #e5ecea;
  border-radius: var(--lx-radius-media);
}
.destination-item__placeholder {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  color: var(--lx-color-text-tertiary);
  font-size: 20rpx;
}
.destination-item__body {
  min-width: 0;
  padding: 4rpx 0;
}
.destination-item__title {
  color: var(--lx-color-text-main);
  font-size: 31rpx;
  font-weight: 650;
  line-height: 1.38;
  overflow-wrap: anywhere;
}
.destination-item__summary {
  display: -webkit-box;
  margin-top: 10rpx;
  overflow: hidden;
  color: var(--lx-color-text-secondary);
  font-size: 24rpx;
  line-height: 1.55;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.destination-item__address {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  gap: 7rpx;
  margin-top: 12rpx;
  color: var(--lx-color-text-tertiary);
  font-size: 22rpx;
  line-height: 1.45;
}
.destination-item__address text {
  min-width: 0;
  overflow-wrap: anywhere;
}

@media (max-width: 340px) {
  .destination-item {
    grid-template-columns: 190rpx minmax(0, 1fr);
    gap: 18rpx;
  }
}
</style>
