<script lang="ts" setup>
withDefaults(defineProps<{
  address?: null | string
  openingHours?: null | string
  phone?: null | string
  ticketInfo?: null | string
}>(), {
  address: '',
  openingHours: '',
  phone: '',
  ticketInfo: '',
})

defineEmits<{ call: [] }>()
</script>

<template>
  <view v-if="address || openingHours || ticketInfo || phone" class="visit-info">
    <view class="visit-info__title">
      到访信息
    </view>
    <view class="visit-info__rows">
      <view v-if="address" class="visit-info__row">
        <text class="visit-info__label">地址</text><text class="visit-info__value">{{ address }}</text>
      </view>
      <view v-if="openingHours" class="visit-info__row">
        <text class="visit-info__label">开放时间</text><text class="visit-info__value">{{ openingHours }}</text>
      </view>
      <view v-if="ticketInfo" class="visit-info__row">
        <text class="visit-info__label">游览信息</text><text class="visit-info__value">{{ ticketInfo }}</text>
      </view>
      <view v-if="phone" class="visit-info__row visit-info__row--action">
        <text class="visit-info__label">联系电话</text>
        <wd-button variant="text" size="small" icon="phone" @click="$emit('call')">
          {{ phone }}
        </wd-button>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.visit-info {
  margin-top: var(--lx-space-section);
}
.visit-info__title {
  color: var(--lx-color-text-main);
  font-size: var(--lx-font-section);
  font-weight: 650;
}
.visit-info__rows {
  margin-top: 16rpx;
  border-top: 1px solid var(--lx-color-border-strong);
}
.visit-info__row {
  display: grid;
  grid-template-columns: 150rpx minmax(0, 1fr);
  gap: 18rpx;
  padding: 21rpx 0;
  border-bottom: 1px solid var(--lx-color-border);
  font-size: 25rpx;
  line-height: 1.55;
}
.visit-info__label {
  color: var(--lx-color-text-tertiary);
}
.visit-info__value {
  color: var(--lx-color-text-secondary);
  overflow-wrap: anywhere;
}
.visit-info__row--action {
  align-items: center;
}
.visit-info__row--action :deep(.wd-button) {
  justify-self: start;
  max-width: 100%;
  height: auto;
  padding: 0;
  text-align: left;
  white-space: normal;
}

@media (max-width: 340px) {
  .visit-info__row {
    grid-template-columns: 122rpx minmax(0, 1fr);
  }
}
</style>
