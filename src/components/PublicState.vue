<script lang="ts" setup>
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  actionText?: string
  description?: string
  kind: 'loading' | 'filtered-empty' | 'initial-empty' | 'network-error' | 'not-found' | 'unauthenticated'
  title: string
}>(), {
  actionText: '',
  description: '',
})

defineEmits<{ action: [] }>()

const iconName = computed(() => ({
  'filtered-empty': 'search',
  'initial-empty': 'info-circle',
  'network-error': 'network',
  'not-found': 'warning',
  'unauthenticated': 'user',
}[props.kind] ?? 'info-circle'))
</script>

<template>
  <view class="public-state" :class="`public-state--${kind}`">
    <wd-loading v-if="kind === 'loading'" size="28" />
    <view v-else class="public-state__icon">
      <wd-icon :name="iconName" size="30" />
    </view>
    <view class="public-state__copy">
      <view class="public-state__title">
        {{ title }}
      </view>
      <view v-if="description" class="public-state__description">
        {{ description }}
      </view>
    </view>
    <wd-button v-if="actionText" size="small" :variant="kind === 'network-error' ? 'plain' : 'soft'" @click="$emit('action')">
      {{ actionText }}
    </wd-button>
  </view>
</template>

<style lang="scss" scoped>
.public-state {
  display: flex;
  min-height: 360rpx;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 18rpx;
  padding: 52rpx 8rpx;
  color: var(--lx-color-text-secondary);
  box-sizing: border-box;
}

.public-state--loading {
  min-height: 240rpx;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
}

.public-state__icon {
  display: flex;
  width: 64rpx;
  height: 64rpx;
  align-items: center;
  justify-content: center;
  color: var(--lx-color-text-tertiary);
  border: 1px solid var(--lx-color-border);
  border-radius: 50%;
}

.public-state--network-error .public-state__icon,
.public-state--not-found .public-state__icon {
  color: var(--lx-color-status-warning);
  border-color: #ead9b7;
}

.public-state__copy {
  max-width: 560rpx;
}

.public-state__title {
  color: var(--lx-color-text-main);
  font-size: 30rpx;
  font-weight: 650;
  line-height: 1.45;
}

.public-state--loading .public-state__title {
  color: var(--lx-color-text-secondary);
  font-size: 25rpx;
  font-weight: 500;
}

.public-state__description {
  margin-top: 10rpx;
  color: var(--lx-color-text-tertiary);
  font-size: 24rpx;
  line-height: 1.65;
  overflow-wrap: anywhere;
}
</style>
