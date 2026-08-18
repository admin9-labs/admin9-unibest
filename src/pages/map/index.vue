<script lang="ts" setup>
import type { MapPoint, MapPointType } from '@/api/map-points'
// #ifdef H5
import type { TencentMapInstance, TencentMarkerInstance } from '@/utils/tencent-map'
// #endif
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { getMapPoints } from '@/api/map-points'
import PublicState from '@/components/PublicState.vue'
// #ifdef H5
import { loadTencentMap, openTencentRoute } from '@/utils/tencent-map'
// #endif

defineOptions({ name: 'TravelMap' })
definePage({ style: { navigationBarTitleText: '地图导览' } })

interface MiniProgramMapMarker {
  id: number
  latitude: number
  longitude: number
  title: string
  callout?: {
    content: string
    color: string
    fontSize: number
    borderRadius: number
    bgColor: string
    padding: number
    display: 'ALWAYS'
  }
}

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
const hasLocated = ref(false)
const locationMessage = ref('')
const mapCenter = ref({ ...defaultCenter })
const mapScale = ref(12)

// #ifdef H5
let map: TencentMapInstance | null = null
let markers: TencentMarkerInstance | null = null
let TMap: Awaited<ReturnType<typeof loadTencentMap>> | null = null
// #endif

const visiblePoints = computed(() => {
  const query = keyword.value.trim().toLocaleLowerCase()
  return points.value.filter(point => (!selectedType.value || point.type === selectedType.value)
    && (!query || point.name.toLocaleLowerCase().includes(query) || point.address?.toLocaleLowerCase().includes(query)))
})
const selectedPoint = computed(() => visiblePoints.value.find(point => point.id === selectedId.value) ?? visiblePoints.value[0] ?? null)

// #ifdef MP-WEIXIN
const miniProgramMarkerPoints = computed(() => visiblePoints.value.map((point, index) => ({
  point,
  marker: {
    id: index + 1,
    latitude: point.latitude,
    longitude: point.longitude,
    title: point.name,
    callout: selectedPoint.value?.id === point.id
      ? {
          content: point.name,
          color: '#172322',
          fontSize: 12,
          borderRadius: 6,
          bgColor: '#ffffff',
          padding: 6,
          display: 'ALWAYS' as const,
        }
      : undefined,
  } satisfies MiniProgramMapMarker,
})))
const miniProgramMarkers = computed(() => miniProgramMarkerPoints.value.map(item => item.marker))
// #endif

// #ifdef H5
function markerGeometries() {
  if (!TMap)
    return []
  return visiblePoints.value.map(point => ({
    id: point.id,
    position: new TMap!.LatLng(point.latitude, point.longitude),
    properties: { title: point.name },
  }))
}
// #endif

function centerMap(latitude: number, longitude: number, scale: number) {
  mapCenter.value = { latitude, longitude }
  mapScale.value = scale
  // #ifdef H5
  if (map && TMap) {
    map.setCenter(new TMap.LatLng(latitude, longitude))
    map.setZoom(scale)
  }
  // #endif
}

function selectPoint(point: MapPoint, scale = 15) {
  selectedId.value = point.id
  centerMap(point.latitude, point.longitude, scale)
}

// #ifdef H5
async function initializeMap() {
  try {
    TMap = await loadTencentMap(import.meta.env.VITE_QQ_MAP_KEY ?? '')
    await nextTick()
    const container = document.getElementById('travel-map')
    if (!container)
      throw new Error('Map container is unavailable')
    const center = selectedPoint.value ?? mapCenter.value
    map = new TMap.Map(container, { center: new TMap.LatLng(center.latitude, center.longitude), zoom: mapScale.value })
    markers = new TMap.MultiMarker({ map, geometries: markerGeometries() })
    markers.on('click', (event) => {
      const point = visiblePoints.value.find(item => item.id === event.geometry?.id)
      if (point)
        selectPoint(point)
    })
  }
  catch {
    mapFailed.value = true
  }
}
// #endif

async function load() {
  loading.value = true
  failed.value = false
  mapFailed.value = false
  try {
    points.value = await getMapPoints()
    const first = points.value[0]
    selectedId.value = first?.id ?? ''
    if (first)
      centerMap(first.latitude, first.longitude, 12)
    else
      centerMap(defaultCenter.latitude, defaultCenter.longitude, 12)
  }
  catch {
    failed.value = true
  }
  finally {
    loading.value = false
  }
  // #ifdef H5
  if (!failed.value)
    await initializeMap()
  // #endif
}

function locateMe() {
  if (locating.value)
    return
  locating.value = true
  locationMessage.value = ''
  uni.getLocation({
    type: 'gcj02',
    success: ({ latitude, longitude }) => {
      locating.value = false
      hasLocated.value = true
      locationMessage.value = '已定位到当前位置'
      centerMap(latitude, longitude, 14)
    },
    fail: () => {
      locating.value = false
      hasLocated.value = false
      locationMessage.value = '未获取定位，仍可浏览和搜索点位'
    },
  })
}

// #ifdef MP-WEIXIN
function selectMiniProgramMarker(event: { detail: { markerId: number | string } }) {
  const markerId = Number(event.detail.markerId)
  const point = miniProgramMarkerPoints.value.find(item => item.marker.id === markerId)?.point
  if (point)
    selectPoint(point)
}

function handleMiniProgramMapError() {
  mapFailed.value = true
}
// #endif

function openDetail(point: MapPoint) {
  uni.navigateTo({ url: point.detailUrl })
}

function navigate(point: MapPoint) {
  // #ifdef H5
  try {
    openTencentRoute(point)
  }
  catch {
    uni.openLocation({
      latitude: point.latitude,
      longitude: point.longitude,
      name: point.name,
      address: point.address ?? '',
    })
  }
  // #endif
  // #ifdef MP-WEIXIN
  uni.openLocation({
    latitude: point.latitude,
    longitude: point.longitude,
    name: point.name,
    address: point.address ?? '',
  })
  // #endif
}

function resetFilters() {
  keyword.value = ''
  selectedType.value = ''
}

watch(visiblePoints, (items) => {
  const nextSelected = items.find(point => point.id === selectedId.value) ?? items[0]
  if (!nextSelected) {
    selectedId.value = ''
  }
  else if (nextSelected.id !== selectedId.value) {
    selectPoint(nextSelected, 13)
  }
  // #ifdef H5
  markers?.setGeometries(markerGeometries())
  // #endif
})
onLoad(load)
// #ifdef H5
onBeforeUnmount(() => {
  markers?.setMap(null)
  map?.destroy?.()
})
// #endif
</script>

<template>
  <view class="page">
    <view class="page-content">
      <view class="toolbar">
        <wd-search v-model="keyword" placeholder="搜索名称或地址" variant="light" hide-cancel :maxlength="120" />
        <scroll-view class="filters" scroll-x>
          <view class="filter-row">
            <view v-for="filter in filters" :key="filter.value || 'all'" class="filter-option" :class="{ 'filter-option--active': selectedType === filter.value }" role="button" @click="selectedType = filter.value">
              {{ filter.label }}
            </view>
          </view>
        </scroll-view>
      </view>

      <view v-if="loading" class="state-shell">
        <PublicState kind="loading" title="正在加载西昌点位" />
      </view>
      <view v-else-if="failed" class="state-shell">
        <PublicState kind="network-error" title="地图点位暂时无法加载" description="请检查网络后重新尝试。" action-text="重新加载" @action="load" />
      </view>
      <template v-else>
        <view class="result-heading">
          <text class="result-title">地图点位</text><text class="result-count">{{ visiblePoints.length }} 处</text>
        </view>
        <view class="map-shell">
          <!-- #ifdef H5 -->
          <view id="travel-map" class="map-canvas" />
          <view v-if="mapFailed" class="map-fallback">
            <wd-icon name="location" size="34" />
            <text>地图画布未能加载</text>
            <text class="fallback-copy">可继续从下方点位列表查看详情或发起导航</text>
          </view>
          <wd-button class="locate-button" size="small" icon="position" :loading="locating" @click="locateMe">
            定位
          </wd-button>
          <!-- #endif -->
          <!-- #ifdef MP-WEIXIN -->
          <map
            v-if="!mapFailed"
            id="travel-map-native"
            class="map-canvas"
            :latitude="mapCenter.latitude"
            :longitude="mapCenter.longitude"
            :scale="mapScale"
            :markers="miniProgramMarkers"
            :show-location="hasLocated"
            @markertap="selectMiniProgramMarker"
            @error="handleMiniProgramMapError"
          >
            <cover-view class="native-locate-button" @click.stop="locateMe">
              {{ locating ? '定位中' : '定位' }}
            </cover-view>
          </map>
          <view v-else class="map-fallback">
            <wd-icon name="location" size="34" />
            <text>地图画布未能加载</text>
            <text class="fallback-copy">可继续从下方点位列表查看详情或发起导航</text>
          </view>
          <!-- #endif -->
        </view>
        <view v-if="locationMessage" class="map-meta">
          <text class="location-message">
            {{ locationMessage }}
          </text>
        </view>
        <view v-if="selectedPoint" class="selected-place">
          <view class="selected-place__copy">
            <view class="selected-place__type">
              {{ selectedPoint.typeName }}
            </view>
            <view class="selected-place__name">
              {{ selectedPoint.name }}
            </view>
            <view v-if="selectedPoint.address" class="selected-place__address">
              {{ selectedPoint.address }}
            </view>
          </view>
          <view class="selected-place__actions">
            <wd-button size="small" variant="text" @click="openDetail(selectedPoint)">
              查看详情
            </wd-button>
            <wd-button size="small" icon="navigation" @click="navigate(selectedPoint)">
              导航
            </wd-button>
          </view>
        </view>
        <view v-if="visiblePoints.length === 0" class="empty-shell">
          <PublicState
            :kind="keyword.trim() || selectedType ? 'filtered-empty' : 'initial-empty'"
            :title="keyword.trim() || selectedType ? '未找到匹配的点位' : '暂时没有可导航点位'"
            :description="keyword.trim() || selectedType ? '可以清除搜索和类型筛选。' : ''"
            :action-text="keyword.trim() || selectedType ? '重置筛选' : ''"
            @action="resetFilters"
          />
        </view>
        <view v-else class="point-section">
          <view class="point-section__title">
            全部点位
          </view>
          <view class="point-list">
            <view v-for="point in visiblePoints" :key="point.id" class="point" :class="{ selected: selectedPoint?.id === point.id }" role="button" @click="selectPoint(point)">
              <view class="point-main">
                <view class="point-title">
                  {{ point.name }}
                </view>
                <view class="point-meta">
                  <text>{{ point.typeName }}</text><template v-if="point.address">
                    <text class="point-dot">·</text><text>{{ point.address }}</text>
                  </template>
                </view>
              </view>
              <wd-icon name="location" size="18" :color="selectedPoint?.id === point.id ? 'var(--lx-color-primary)' : 'var(--lx-color-text-tertiary)'" />
            </view>
          </view>
        </view>
      </template>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
  background: var(--lx-color-surface-muted, #f3f7f7);
  box-sizing: border-box;
}

.page-content {
  width: 100%;
  max-width: var(--lx-page-max);
  margin: 0 auto;
}

.toolbar {
  padding: 20rpx 28rpx 18rpx;
  background: var(--lx-color-surface, #fff);
}

.filters {
  width: 100%;
  margin-top: 16rpx;
  white-space: nowrap;
}

.filter-row {
  display: inline-flex;
  gap: 30rpx;
  min-width: 100%;
  padding: 2rpx 0;
}

.filter-option {
  position: relative;
  flex: 0 0 auto;
  padding: 10rpx 0 13rpx;
  color: var(--lx-color-text-tertiary);
  font-size: 24rpx;
  line-height: 1;
}

.filter-option--active {
  color: var(--lx-color-primary-strong);
  font-weight: 650;
}

.filter-option--active::after {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 3rpx;
  background: var(--lx-color-primary);
  content: '';
}

.state-shell {
  min-height: 72vh;
  padding: 28rpx;
  box-sizing: border-box;
}

.result-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 24rpx 28rpx 18rpx;
}

.result-title {
  color: var(--lx-color-text-main, #172322);
  font-size: 28rpx;
  font-weight: 650;
}

.result-count {
  color: var(--lx-color-text-tertiary);
  font-size: 22rpx;
}

.map-shell {
  position: relative;
  height: 680rpx;
  min-height: 300px;
  max-height: 440px;
  overflow: hidden;
  background: #dcecee;
  box-sizing: border-box;
}

.map-canvas {
  position: relative;
  z-index: 0;
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
  color: var(--lx-color-primary-strong, #08666d);
  background: #dcecee;
  box-sizing: border-box;
  text-align: center;
}

.fallback-copy {
  color: var(--lx-color-text-secondary, #566766);
  font-size: 24rpx;
  line-height: 1.6;
}

.locate-button {
  position: absolute;
  z-index: 2;
  right: 20rpx;
  bottom: 20rpx;
  box-shadow: 0 4rpx 14rpx rgb(22 65 68 / 12%);
}

.native-locate-button {
  position: absolute;
  z-index: 2;
  right: 20rpx;
  bottom: 20rpx;
  min-width: 104rpx;
  padding: 14rpx 18rpx;
  color: #fff;
  background: var(--lx-color-primary, #0b7f86);
  border-radius: 8px;
  box-shadow: 0 4rpx 14rpx rgb(22 65 68 / 12%);
  font-size: 24rpx;
  line-height: 1;
  text-align: center;
}

.map-meta {
  padding: 12rpx 28rpx 6rpx;
}

.location-message {
  min-width: 0;
  color: var(--lx-color-secondary, #1a806b);
  font-size: 22rpx;
  line-height: 1.45;
}

.selected-place {
  display: flex;
  min-width: 0;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20rpx;
  margin: 0 28rpx;
  padding: 24rpx 0 28rpx;
  border-bottom: 1px solid var(--lx-color-border-strong);
}

.selected-place__copy {
  min-width: 0;
  flex: 1;
}
.selected-place__type {
  color: var(--lx-color-text-tertiary);
  font-size: 21rpx;
}
.selected-place__name {
  margin-top: 7rpx;
  color: var(--lx-color-text-main);
  font-size: 32rpx;
  font-weight: 680;
  line-height: 1.4;
  overflow-wrap: anywhere;
}
.selected-place__address {
  margin-top: 7rpx;
  color: var(--lx-color-text-secondary);
  font-size: 23rpx;
  line-height: 1.5;
  overflow-wrap: anywhere;
}
.selected-place__actions {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 6rpx;
}
.empty-shell {
  padding: 0 28rpx;
}
.point-section {
  margin: 38rpx 28rpx 0;
}
.point-section__title {
  color: var(--lx-color-text-main);
  font-size: 28rpx;
  font-weight: 650;
}
.point-list {
  margin-top: 14rpx;
  border-top: 1px solid var(--lx-color-border-strong);
}

.point {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
  min-height: 108rpx;
  padding: 20rpx 0;
  background: transparent;
  border-bottom: 1px solid var(--lx-color-border);
  box-sizing: border-box;
}

.point:last-child {
  border-bottom: 0;
}

.point.selected {
  color: var(--lx-color-primary);
}

.point-main {
  flex: 1;
  min-width: 0;
}

.point-title {
  color: var(--lx-color-text-main, #172322);
  font-size: 28rpx;
  font-weight: 600;
  line-height: 1.45;
  overflow-wrap: anywhere;
}

.point-meta {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  margin-top: 10rpx;
  color: var(--lx-color-text-secondary, #566766);
  font-size: 23rpx;
  line-height: 1.5;
  overflow-wrap: anywhere;
}
.point-dot {
  margin: 0 7rpx;
}

@media (min-width: 600px) {
  .map-shell {
    height: 440px;
  }
}

@media (max-width: 360px) {
  .point {
    align-items: center;
  }

  .selected-place {
    align-items: flex-start;
    flex-direction: column;
  }
  .selected-place__actions {
    align-self: stretch;
    justify-content: flex-end;
  }
}
</style>
