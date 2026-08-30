<script lang="ts" setup>
import type { MapAnchorType, MapPoint } from '@/api/map-points'
import { ref, watch } from 'vue'
import { createLatestMapRequestGate, getNearbyMapPoints } from '@/api/map-points'

const props = withDefaults(defineProps<{
  anchorType: MapAnchorType
  anchorId: number
  eligible?: boolean
  title?: string
}>(), { title: '附近有什么', eligible: false })

const points = ref<MapPoint[]>([])
const loading = ref(false)
const failed = ref(false)
const gate = createLatestMapRequestGate()

async function load() {
  gate.invalidate()
  points.value = []
  failed.value = false
  if (!props.eligible)
    return
  const generation = gate.begin()
  loading.value = true
  try {
    const result = await getNearbyMapPoints(props.anchorType, props.anchorId)
    if (gate.isCurrent(generation))
      points.value = result.points
  }
  catch {
    if (gate.isCurrent(generation))
      failed.value = true
  }
  finally {
    if (gate.isCurrent(generation))
      loading.value = false
  }
}

function openPoint(point: MapPoint) {
  uni.navigateTo({ url: point.detailUrl })
}

function openMap() {
  uni.navigateTo({ url: `/pages/map/index?anchor_type=${props.anchorType}&anchor_id=${props.anchorId}` })
}

function distanceLabel(point: MapPoint) {
  if (point.distance_meters === null)
    return ''
  return point.distance_meters < 1000 ? `约 ${point.distance_meters} 米` : `约 ${(point.distance_meters / 1000).toFixed(1)} 公里`
}

watch(() => [props.anchorType, props.anchorId, props.eligible], load, { immediate: true })
</script>

<template>
  <view v-if="eligible" class="nearby-section">
    <view class="section-heading">
      <text>{{ title }}</text>
      <wd-button size="small" variant="text" icon="location" @click="openMap">
        地图查看
      </wd-button>
    </view>
    <view v-if="loading" class="nearby-state">
      <wd-loading text="正在加载周边配套" />
    </view>
    <view v-else-if="failed" class="nearby-state">
      <wd-button size="small" variant="text" @click="load">
        重新加载周边配套
      </wd-button>
    </view>
    <view v-else-if="points.length" class="nearby-list">
      <view v-for="point in points.slice(0, 8)" :key="point.key" class="nearby-item" role="link" @click="openPoint(point)">
        <view class="nearby-copy">
          <view class="nearby-type">
            {{ point.typeName }}
          </view>
          <view class="nearby-name">
            {{ point.name }}
          </view>
          <view class="nearby-meta">
            <text>{{ distanceLabel(point) }}</text>
            <text v-if="point.route_node_name">距“{{ point.route_node_name }}”节点</text>
          </view>
        </view>
        <wd-icon name="arrow-right" size="18" />
      </view>
    </view>
    <view v-else class="nearby-empty">
      当前范围暂无已核验配套点位
    </view>
  </view>
</template>

<style lang="scss" scoped>
.nearby-section {
  margin-top: 40rpx;
}
.section-heading {
  display: flex;
  min-height: 64rpx;
  align-items: center;
  justify-content: space-between;
  color: var(--lx-color-text-main);
  font-size: 31rpx;
  font-weight: 650;
}
.nearby-list {
  border-top: 1px solid var(--lx-color-border-strong);
}
.nearby-item {
  display: flex;
  min-height: 112rpx;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
  padding: 18rpx 0;
  border-bottom: 1px solid var(--lx-color-border);
}
.nearby-copy {
  min-width: 0;
  flex: 1;
}
.nearby-type {
  color: var(--lx-color-primary-strong);
  font-size: 21rpx;
}
.nearby-name {
  margin-top: 5rpx;
  color: var(--lx-color-text-main);
  font-size: 27rpx;
  font-weight: 600;
  overflow-wrap: anywhere;
}
.nearby-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
  margin-top: 6rpx;
  color: var(--lx-color-text-tertiary);
  font-size: 22rpx;
}
.nearby-state,
.nearby-empty {
  padding: 28rpx 0;
  color: var(--lx-color-text-tertiary);
  text-align: center;
}
</style>
