<script lang="ts" setup>
withDefaults(defineProps<{
  imageUrl?: null | string
  layout?: 'horizontal' | 'vertical'
  summary?: null | string
  title: string
}>(), {
  imageUrl: '',
  layout: 'horizontal',
  summary: '',
})

defineEmits<{
  click: []
}>()
</script>

<template>
  <view
    class="public-content-card"
    :class="`public-content-card--${layout}`"
    role="link"
    hover-class="public-content-card--pressed"
    @click="$emit('click')"
  >
    <view class="public-content-card__media">
      <wd-img
        v-if="imageUrl"
        :src="imageUrl"
        width="100%"
        height="100%"
        mode="aspectFill"
        radius="0"
        lazy-load
      >
        <template #loading>
          <view class="public-content-card__placeholder">
            <wd-loading color="var(--lx-color-primary)" />
          </view>
        </template>
        <template #error>
          <view class="public-content-card__placeholder">
            <wd-icon name="image" size="28" />
            <text>暂无图片</text>
          </view>
        </template>
      </wd-img>
      <view v-else class="public-content-card__placeholder">
        <wd-icon name="image" size="28" />
        <text>暂无图片</text>
      </view>
    </view>

    <view class="public-content-card__body">
      <view v-if="$slots.eyebrow" class="public-content-card__eyebrow">
        <slot name="eyebrow" />
      </view>
      <view class="public-content-card__heading">
        <view class="public-content-card__title">
          {{ title }}
        </view>
        <view v-if="$slots.badge" class="public-content-card__badge">
          <slot name="badge" />
        </view>
      </view>
      <view v-if="summary" class="public-content-card__summary">
        {{ summary }}
      </view>
      <view v-if="$slots.meta" class="public-content-card__meta">
        <slot name="meta" />
      </view>
      <view v-if="$slots.footer" class="public-content-card__footer">
        <slot name="footer" />
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.public-content-card {
  min-width: 0;
  overflow: hidden;
  box-sizing: border-box;
}

.public-content-card--horizontal {
  display: grid;
  grid-template-columns: minmax(220rpx, 42%) minmax(0, 1fr);
  min-height: 224rpx;
  align-items: stretch;
  padding: 18rpx 0;
  border-bottom: 1px solid var(--lx-color-border);
}

.public-content-card--vertical {
  display: block;
  background: var(--lx-color-surface);
  border: 1px solid var(--lx-color-border);
  border-radius: var(--lx-radius-card);
}

.public-content-card--pressed {
  background: var(--lx-color-surface-pressed);
}

.public-content-card__media {
  width: 100%;
  height: 100%;
  min-height: 188rpx;
  overflow: hidden;
  background: #e5efef;
  border-radius: 6px;
}

.public-content-card--vertical .public-content-card__media {
  height: 300rpx;
}

.public-content-card__placeholder {
  display: flex;
  width: 100%;
  height: 100%;
  min-height: inherit;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  color: var(--lx-color-text-tertiary);
  background: #e9eeed;
  font-size: 21rpx;
  line-height: 1.4;
}

.public-content-card__body {
  min-width: 0;
  padding: 16rpx 12rpx 16rpx 24rpx;
  box-sizing: border-box;
}

.public-content-card--vertical .public-content-card__body {
  padding: 26rpx;
}

.public-content-card__eyebrow {
  margin-bottom: 7rpx;
  color: var(--lx-color-text-tertiary);
  font-size: 21rpx;
  line-height: 1.4;
}

.public-content-card__heading {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12rpx;
}

.public-content-card__title {
  min-width: 0;
  color: var(--lx-color-text-main);
  font-size: 30rpx;
  font-weight: 650;
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.public-content-card--vertical .public-content-card__title {
  font-size: 32rpx;
}

.public-content-card__badge {
  flex: 0 0 auto;
}

.public-content-card__summary {
  display: -webkit-box;
  margin-top: 9rpx;
  overflow: hidden;
  color: var(--lx-color-text-secondary);
  font-size: 24rpx;
  line-height: 1.55;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.public-content-card__meta,
.public-content-card__footer {
  margin-top: 12rpx;
  color: var(--lx-color-text-tertiary);
  font-size: 22rpx;
  line-height: 1.5;
}

@media (max-width: 340px) {
  .public-content-card--horizontal {
    grid-template-columns: minmax(176rpx, 40%) minmax(0, 1fr);
  }

  .public-content-card__body {
    padding: 18rpx;
  }
}

@media (min-width: 760px) {
  .public-content-card--horizontal {
    grid-template-columns: minmax(300px, 38%) minmax(0, 1fr);
    min-height: 250px;
    padding: 22px 0;
  }

  .public-content-card--horizontal .public-content-card__media {
    min-height: 206px;
  }

  .public-content-card__body {
    padding: 28px 24px 24px 34px;
  }

  .public-content-card__title {
    font-size: 22px;
  }

  .public-content-card__summary {
    margin-top: 12px;
    font-size: 15px;
    line-height: 1.7;
    -webkit-line-clamp: 3;
  }
}
</style>
