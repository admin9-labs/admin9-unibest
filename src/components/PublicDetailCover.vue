<script lang="ts" setup>
withDefaults(defineProps<{
  height?: string
  src?: null | string
}>(), {
  height: '440rpx',
  src: '',
})
</script>

<template>
  <view class="public-detail-cover" :style="{ height }">
    <wd-img v-if="src" :src="src" width="100%" height="100%" mode="aspectFill" radius="0" enable-preview>
      <template #loading>
        <view class="public-detail-cover__fallback">
          <wd-loading color="var(--lx-color-primary)" />
        </view>
      </template>
      <template #error>
        <view class="public-detail-cover__fallback">
          <wd-icon name="image" size="36" />
          <text>暂无图片</text>
        </view>
      </template>
    </wd-img>
    <view v-else class="public-detail-cover__fallback">
      <wd-icon name="image" size="36" />
      <text>暂无图片</text>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.public-detail-cover {
  width: 100%;
  min-height: 360rpx;
  overflow: hidden;
  background: #e5efef;
}

.public-detail-cover__fallback {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  color: var(--lx-color-text-tertiary);
  background: #e9eeed;
  font-size: 23rpx;
}
</style>
