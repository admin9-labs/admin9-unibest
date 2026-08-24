<script lang="ts" setup>
import type { AiRecommendation } from '@/api/ai-assistants'

defineProps<{ items: AiRecommendation[] }>()
defineEmits<{ select: [item: AiRecommendation] }>()

function typeLabel(type: AiRecommendation['type']) {
  return { attraction: '景区', scenic_spot: '景点', travel_route: '线路' }[type]
}

function durationLabel(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const remaining = minutes % 60
  if (hours && remaining)
    return `${hours} 小时 ${remaining} 分钟`
  if (hours)
    return `${hours} 小时`
  return `${remaining} 分钟`
}

function meta(item: AiRecommendation) {
  return item.address || (item.duration_minutes === null ? '' : `建议用时 ${durationLabel(item.duration_minutes)}`)
}
</script>

<template>
  <view class="recommendations">
    <view class="recommendations-title">
      相关推荐
    </view>
    <view
      v-for="item in items"
      :key="`${item.type}:${item.id}`"
      class="recommendation-item"
      role="link"
      hover-class="recommendation-item--pressed"
      @click="$emit('select', item)"
    >
      <view class="recommendation-media">
        <wd-img v-if="item.cover?.url" :src="item.cover.url" width="100%" height="100%" mode="aspectFill" radius="0" lazy-load>
          <template #loading>
            <view class="recommendation-placeholder">
              <wd-loading color="var(--lx-color-primary)" />
            </view>
          </template>
          <template #error>
            <view class="recommendation-placeholder">
              <wd-icon name="image" size="22" />
            </view>
          </template>
        </wd-img>
        <view v-else class="recommendation-placeholder">
          <wd-icon name="image" size="22" />
        </view>
      </view>
      <view class="recommendation-copy">
        <view class="recommendation-type">
          {{ typeLabel(item.type) }}
        </view>
        <view class="recommendation-heading">
          <view class="recommendation-name">
            {{ item.title }}
          </view>
          <wd-icon name="arrow-right" size="16" color="var(--lx-color-text-tertiary)" />
        </view>
        <view v-if="item.summary" class="recommendation-summary">
          {{ item.summary }}
        </view>
        <view v-if="meta(item)" class="recommendation-meta">
          {{ meta(item) }}
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.recommendations {
  margin-top: 20rpx;
  padding-top: 18rpx;
  border-top: 1px solid var(--lx-color-border);
  white-space: normal;
}

.recommendations-title {
  margin-bottom: 4rpx;
  color: var(--lx-color-text-secondary);
  font-size: 22rpx;
  font-weight: 600;
}

.recommendation-item {
  display: grid;
  grid-template-columns: 164rpx minmax(0, 1fr);
  gap: 18rpx;
  min-width: 0;
  padding: 18rpx 0;
  border-bottom: 1px solid var(--lx-color-border);
}

.recommendation-item--pressed {
  background: var(--lx-color-surface-pressed);
}

.recommendation-media,
.recommendation-placeholder {
  width: 164rpx;
  height: 124rpx;
  overflow: hidden;
  background: #e9eeed;
  border-radius: 6px;
}

.recommendation-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--lx-color-text-tertiary);
}

.recommendation-copy {
  min-width: 0;
}

.recommendation-type {
  color: var(--lx-color-primary-strong);
  font-size: 20rpx;
  line-height: 1.35;
}

.recommendation-heading {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  gap: 10rpx;
  margin-top: 4rpx;
}

.recommendation-name {
  min-width: 0;
  flex: 1;
  color: var(--lx-color-text-main);
  font-size: 27rpx;
  font-weight: 650;
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.recommendation-summary {
  display: -webkit-box;
  margin-top: 7rpx;
  overflow: hidden;
  color: var(--lx-color-text-secondary);
  font-size: 22rpx;
  line-height: 1.45;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.recommendation-meta {
  margin-top: 7rpx;
  color: var(--lx-color-text-tertiary);
  font-size: 20rpx;
  line-height: 1.4;
  overflow-wrap: anywhere;
}

@media (max-width: 340px) {
  .recommendation-item {
    grid-template-columns: 140rpx minmax(0, 1fr);
  }

  .recommendation-media,
  .recommendation-placeholder {
    width: 140rpx;
    height: 106rpx;
  }
}
</style>
