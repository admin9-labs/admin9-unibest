<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps<{
  content?: null | string
  title: string
}>()

const normalizedContent = computed(() => props.content?.trim() ?? '')
const isRichContent = computed(() => /<(?:p|br|h[2-4]|strong|em|[biua]|ul|ol|li|blockquote|img)[\s/>]/i.test(normalizedContent.value))
const hasContent = computed(() => {
  if (!normalizedContent.value)
    return false
  if (!isRichContent.value)
    return true
  if (/<img(?:\s|>)/i.test(normalizedContent.value))
    return true

  return normalizedContent.value
    .replace(/<[^>]*>/g, '')
    .replace(/&(?:nbsp|#160);/gi, ' ')
    .trim()
    .length > 0
})
</script>

<template>
  <view v-if="hasContent" class="public-content-body">
    <view class="public-content-body__title">
      {{ title }}
    </view>
    <rich-text v-if="isRichContent" class="public-content-body__rich" :nodes="normalizedContent" />
    <text v-else class="public-content-body__plain">{{ normalizedContent }}</text>
  </view>
</template>

<style lang="scss" scoped>
.public-content-body {
  min-width: 0;
  margin-top: 40rpx;
  color: var(--lx-color-text-secondary);
  font-size: 28rpx;
  line-height: 1.85;
  overflow-wrap: anywhere;
  word-break: break-word;
}
.public-content-body__title {
  color: var(--lx-color-text-main);
  font-size: 31rpx;
  font-weight: 650;
  line-height: normal;
}
.public-content-body__plain,
.public-content-body__rich {
  display: block;
  max-width: 100%;
  margin-top: 18rpx;
  overflow-wrap: anywhere;
  word-break: break-word;
}
.public-content-body__plain {
  white-space: pre-wrap;
}
.public-content-body__rich :deep(p) {
  margin: 0 0 20rpx;
}
.public-content-body__rich :deep(p:last-child) {
  margin-bottom: 0;
}
.public-content-body__rich :deep(h2),
.public-content-body__rich :deep(h3),
.public-content-body__rich :deep(h4) {
  margin: 34rpx 0 16rpx;
  color: var(--lx-color-text-main);
  font-weight: 650;
  line-height: 1.5;
}
.public-content-body__rich :deep(h2:first-child),
.public-content-body__rich :deep(h3:first-child),
.public-content-body__rich :deep(h4:first-child) {
  margin-top: 0;
}
.public-content-body__rich :deep(h2) {
  font-size: 36rpx;
}
.public-content-body__rich :deep(h3) {
  font-size: 33rpx;
}
.public-content-body__rich :deep(h4) {
  font-size: 30rpx;
}
.public-content-body__rich :deep(ul),
.public-content-body__rich :deep(ol) {
  margin: 18rpx 0;
  padding-left: 42rpx;
}
.public-content-body__rich :deep(li) {
  margin: 8rpx 0;
}
.public-content-body__rich :deep(blockquote) {
  margin: 24rpx 0;
  padding: 18rpx 22rpx;
  border-left: 6rpx solid var(--lx-color-secondary);
  color: var(--lx-color-text-secondary);
  background: #eaf3f1;
}
.public-content-body__rich :deep(img) {
  display: block;
  max-width: 100% !important;
  height: auto !important;
  margin: 24rpx auto;
  border-radius: 8px;
}
.public-content-body__rich :deep(a) {
  color: var(--lx-color-primary-strong);
  text-decoration: underline;
  overflow-wrap: anywhere;
  word-break: break-all;
}
</style>
