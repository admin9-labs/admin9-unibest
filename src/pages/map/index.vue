<script lang="ts" setup>
import type { MapPoint, MapPointType } from '@/api/map-points'
import type { TencentMapInstance, TencentMarkerInstance } from '@/utils/tencent-map'
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { getMapPoints } from '@/api/map-points'
import { loadTencentMap, openTencentRoute } from '@/utils/tencent-map'

defineOptions({ name: 'TravelMap' })
definePage({ style: { navigationBarTitleText: '西昌地图' } })

const defaultCenter = { latitude: 27.8945, longitude: 102.2644 }
const filters: Array<{ label: string, value: '' | MapPointType }> = [
  { label: '全部', value: '' },
  { label: '景区', value: 'attraction' },
  { label: '景点', value: 'scenic-spot' },
  { label: '餐饮', value: 'restaurant' },
  { label: '住宿', value: 'accommodation' },
]
const points = ref<MapPoint[]>([])
const keyword = ref('')
const selectedType = ref<'' | MapPointType>('')
const selectedId = ref('')
const loading = ref(true)
const failed = ref(false)
const mapFailed = ref(false)
const locating = ref(false)
const locationMessage = ref('')
let map: TencentMapInstance | null = null
let markers: TencentMarkerInstance | null = null
let TMap: Awaited<ReturnType<typeof loadTencentMap>> | null = null

const visiblePoints = computed(() => {
  const query = keyword.value.trim().toLocaleLowerCase()
  return points.value.filter(point => (!selectedType.value || point.type === selectedType.value)
    && (!query || point.name.toLocaleLowerCase().includes(query) || point.address?.toLocaleLowerCase().includes(query)))
})
const selectedPoint = computed(() => visiblePoints.value.find(point => point.id === selectedId.value) ?? visiblePoints.value[0] ?? null)

function markerGeometries() {
  if (!TMap)
    return []
  return visiblePoints.value.map(point => ({
    id: point.id,
    position: new TMap!.LatLng(point.latitude, point.longitude),
    properties: { title: point.name },
  }))
}

function selectPoint(point: MapPoint) {
  selectedId.value = point.id
  if (map && TMap) {
    map.setCenter(new TMap.LatLng(point.latitude, point.longitude))
    map.setZoom(15)
  }
}

async function initializeMap() {
  if (points.value.length === 0)
    return
  try {
    TMap = await loadTencentMap(import.meta.env.VITE_QQ_MAP_KEY ?? '')
    await nextTick()
    const container = document.getElementById('travel-map')
    if (!container)
      throw new Error('Map container is unavailable')
    const first = selectedPoint.value ?? points.value[0]
    map = new TMap.Map(container, { center: new TMap.LatLng(first.latitude, first.longitude), zoom: 12 })
    markers = new TMap.MultiMarker({ map, geometries: markerGeometries() })
    markers.on('click', (event) => {
      const point = points.value.find(item => item.id === event.geometry?.id)
      if (point)
        selectPoint(point)
    })
  }
  catch {
    mapFailed.value = true
  }
}

async function load() {
  loading.value = true
  failed.value = false
  mapFailed.value = false
  try {
    points.value = await getMapPoints()
    selectedId.value = points.value[0]?.id ?? ''
  }
  catch {
    failed.value = true
  }
  finally {
    loading.value = false
  }
  if (!failed.value)
    await initializeMap()
}

function locateMe() {
  locating.value = true
  locationMessage.value = ''
  uni.getLocation({
    type: 'gcj02',
    success: ({ latitude, longitude }) => {
      locating.value = false
      locationMessage.value = '已定位到当前位置'
      if (map && TMap) {
        map.setCenter(new TMap.LatLng(latitude, longitude))
        map.setZoom(14)
      }
    },
    fail: () => {
      locating.value = false
      locationMessage.value = '未获取定位，仍可浏览和搜索点位'
    },
  })
}

function openDetail(point: MapPoint) {
  uni.navigateTo({ url: point.detailUrl })
}

function navigate(point: MapPoint) {
  try {
    openTencentRoute(point)
  }
  catch {
    uni.openLocation({ latitude: point.latitude, longitude: point.longitude, name: point.name, address: point.address ?? '' })
  }
}

watch(visiblePoints, (items) => {
  if (!items.some(point => point.id === selectedId.value))
    selectedId.value = items[0]?.id ?? ''
  markers?.setGeometries(markerGeometries())
})
onLoad(load)
onBeforeUnmount(() => {
  markers?.setMap(null)
  map?.destroy?.()
})
</script>

<template>
  <view class="page">
    <view class="toolbar">
      <wd-search v-model="keyword" placeholder="搜索点位名称或地址" hide-cancel maxlength="120" />
      <scroll-view class="filters" scroll-x>
        <view class="filter-row">
          <wd-tag v-for="filter in filters" :key="filter.value || 'all'" :type="selectedType === filter.value ? 'primary' : 'default'" :variant="selectedType === filter.value ? 'dark' : 'plain'" size="large" @click="selectedType = filter.value">
            {{ filter.label }}
          </wd-tag>
        </view>
      </scroll-view>
    </view>

    <view v-if="loading" class="state">
      <wd-loading text="正在加载西昌点位" />
    </view>
    <view v-else-if="failed" class="state">
      <wd-empty icon="network" tip="地图点位暂时无法加载">
        <template #bottom>
          <wd-button size="small" @click="load">
            重新加载
          </wd-button>
        </template>
      </wd-empty>
    </view>
    <template v-else>
      <view class="map-shell">
        <view id="travel-map" class="map-canvas" />
        <view v-if="mapFailed" class="map-fallback">
          <wd-icon name="location" size="34" />
          <text>地图画布未能加载</text>
          <text class="fallback-copy">可继续从下方点位列表查看详情或发起导航</text>
        </view>
        <wd-button class="locate-button" size="small" icon="position" :loading="locating" @click="locateMe">
          定位
        </wd-button>
      </view>
      <view v-if="locationMessage" class="location-message">
        {{ locationMessage }}
      </view>
      <view class="result-heading">
        <text>{{ visiblePoints.length }} 个可导航点位</text>
        <text class="coordinate-note">坐标按 GCJ-02 用于腾讯地图</text>
      </view>
      <wd-empty v-if="visiblePoints.length === 0" tip="暂无符合条件的点位" />
      <view v-else class="point-list">
        <view v-for="point in visiblePoints" :key="point.id" class="point" :class="{ selected: selectedPoint?.id === point.id }" role="button" @click="selectPoint(point)">
          <view class="point-main">
            <view class="point-title">
              <wd-tag size="small" type="lightblue" variant="light">
                {{ point.typeName }}
              </wd-tag><text>{{ point.name }}</text>
            </view>
            <view v-if="point.address" class="point-address">
              {{ point.address }}
            </view>
          </view>
          <view class="point-actions">
            <wd-button size="small" variant="text" @click.stop="openDetail(point)">
              详情
            </wd-button>
            <wd-button size="small" icon="navigation" @click.stop="navigate(point)">
              导航
            </wd-button>
          </view>
        </view>
      </view>
    </template>
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f4f6f3;
}
.toolbar {
  padding: 20rpx 28rpx 24rpx;
  background: #fff;
}
.filters {
  width: 100%;
  margin-top: 18rpx;
  white-space: nowrap;
}
.filter-row {
  display: inline-flex;
  gap: 14rpx;
  padding: 2rpx;
}
.state {
  display: flex;
  min-height: 76vh;
  align-items: center;
  justify-content: center;
  padding: 28rpx;
}
.map-shell {
  position: relative;
  height: 630rpx;
  background: #dfe9eb;
}
.map-canvas {
  width: 100%;
  height: 100%;
}
.map-fallback {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14rpx;
  padding: 60rpx;
  color: #416a73;
  background: #dfe9eb;
  box-sizing: border-box;
  text-align: center;
}
.fallback-copy {
  color: #5c6964;
  font-size: 24rpx;
  line-height: 1.6;
}
.locate-button {
  position: absolute;
  right: 24rpx;
  bottom: 24rpx;
}
.location-message {
  padding: 18rpx 28rpx;
  color: #43524b;
  background: #edf4ef;
  font-size: 24rpx;
}
.result-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20rpx;
  padding: 28rpx;
  color: #26332d;
  font-size: 28rpx;
  font-weight: 600;
}
.coordinate-note {
  color: #78817d;
  font-size: 20rpx;
  font-weight: 400;
  text-align: right;
}
.point-list {
  display: grid;
  gap: 18rpx;
  padding: 0 28rpx 56rpx;
}
.point {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
  padding: 24rpx;
  background: #fff;
  border: 1px solid #dce4e5;
  border-radius: 8px;
  box-sizing: border-box;
}
.point.selected {
  border-color: #34765b;
  box-shadow: 0 0 0 1px #34765b;
}
.point-main {
  flex: 1;
  min-width: 0;
}
.point-title {
  display: flex;
  align-items: center;
  gap: 12rpx;
  color: #17211c;
  font-size: 28rpx;
  font-weight: 600;
  overflow-wrap: anywhere;
}
.point-address {
  margin-top: 10rpx;
  color: #69716c;
  font-size: 23rpx;
  line-height: 1.45;
}
.point-actions {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 8rpx;
}
@media (max-width: 360px) {
  .point {
    align-items: flex-start;
    flex-direction: column;
  }
  .point-actions {
    align-self: flex-end;
  }
}
</style>
