<script lang="ts" setup>
defineProps<{
  summary?: null | string
  title: string
}>()
</script>

<template>
  <view class="public-detail-heading">
    <view class="public-detail-heading__row">
      <view class="public-detail-heading__title">
        {{ title }}
      </view>
      <view v-if="$slots.badge" class="public-detail-heading__badge">
        <slot name="badge" />
      </view>
    </view>
    <view v-if="summary" class="public-detail-heading__summary">
      {{ summary }}
    </view>
    <view v-if="$slots.meta" class="public-detail-heading__meta">
      <slot name="meta" />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.public-detail-heading {
  min-width: 0;
}

.public-detail-heading__row {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18rpx;
}

.public-detail-heading__title {
  min-width: 0;
  flex: 1;
  color: var(--lx-color-text-main);
  font-size: 42rpx;
  font-weight: 700;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.public-detail-heading__badge {
  flex: 0 0 auto;
  padding-top: 4rpx;
}

.public-detail-heading__summary {
  margin-top: 14rpx;
  color: var(--lx-color-text-secondary);
  font-size: 27rpx;
  line-height: 1.7;
  overflow-wrap: anywhere;
}

.public-detail-heading__meta {
  margin-top: 18rpx;
  color: var(--lx-color-text-tertiary);
  font-size: 23rpx;
  line-height: 1.5;
}

@media (min-width: 760px) {
  .public-detail-heading__title {
    font-size: 34px;
  }

  .public-detail-heading__summary {
    margin-top: 12px;
    font-size: 17px;
    line-height: 1.7;
  }

  .public-detail-heading__meta {
    font-size: 14px;
  }
}
</style>
