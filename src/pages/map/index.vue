<script lang="ts" setup>
import type { MapAnchorType, MapPoint, MapPointType } from '@/api/map-points'
import type { LocationCoordinate } from '@/utils/location-coordinate'
// #ifdef H5
import type { TencentMapInstance, TencentMarkerInstance } from '@/utils/tencent-map'
// #endif
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { createLatestMapRequestGate, getMapPoints, getNearbyCenterMapPoints, getNearbyMapPoints, markerDisplayMode } from '@/api/map-points'
import PublicState from '@/components/PublicState.vue'
import { currentLocationCoordinateSystem, requestCurrentLocation } from '@/utils/current-location'
import { isUserMapRegionChange, normalizeLocationCoordinate } from '@/utils/location-coordinate'
import { clusterMapPoints } from '@/utils/map-clustering'
// #ifdef H5
import { currentLocationMarkerId, loadTencentMap, openTencentRoute } from '@/utils/tencent-map'
// #endif

defineOptions({ name: 'TravelMap' })
definePage({ style: { navigationBarTitleText: '地图导览' } })

interface Bounds { south: number, west: number, north: number, east: number }
interface MiniMarker { id: number, latitude: number, longitude: number, title: string, callout?: Record<string, unknown> }

const defaultCenter = { latitude: 27.8945, longitude: 102.2644 }
const defaultBounds: Bounds = { south: 27.6, west: 102.0, north: 28.1, east: 102.55 }
const filters: Array<{ label: string, value: '' | MapPointType }> = [
  { label: '全部', value: '' },
  { label: '景区', value: 'attraction' },
  { label: '景点', value: 'scenic_spot' },
  { label: '餐饮', value: 'restaurant' },
  { label: '住宿', value: 'accommodation' },
  { label: '公共服务', value: 'service_information' },
  { label: '停车', value: 'parking_facility' },
]
const points = ref<MapPoint[]>([])
const keyword = ref('')
const selectedType = ref<'' | MapPointType>('')
const selectedKey = ref('')
const loading = ref(true)
const failed = ref(false)
const mapFailed = ref(false)
const tooMany = ref(false)
const locating = ref(false)
const hasLocated = ref(false)
const currentLocation = ref<LocationCoordinate | null>(null)
const locationMode = ref(false)
const locationMessage = ref('')
const mapCenter = ref({ ...defaultCenter })
const mapScale = ref(12)
const hasInitializedCenter = ref(false)
const hasLoadedOnce = ref(false)
const anchorMode = ref(false)
const requestGate = createLatestMapRequestGate()
let boundsTimer: ReturnType<typeof setTimeout> | undefined
let nearbyFilterTimer: ReturnType<typeof setTimeout> | undefined
let locationTimeout: { generation: number, handle: ReturnType<typeof setTimeout> } | undefined
let locationRequestGeneration = 0
let currentViewportBounds: Bounds = { ...defaultBounds }

// #ifdef H5
let map: TencentMapInstance | null = null
let markers: TencentMarkerInstance | null = null
let TMap: Awaited<ReturnType<typeof loadTencentMap>> | null = null
let h5MapContainer: HTMLElement | null = null
let h5UserViewportIntent = false
let h5ViewportIntentTimer: ReturnType<typeof setTimeout> | undefined
// #endif

const visiblePoints = computed(() => {
  const query = keyword.value.trim().toLocaleLowerCase()
  return points.value.filter(point => (!selectedType.value || point.type === selectedType.value)
    && (!query || point.name.toLocaleLowerCase().includes(query) || point.address?.toLocaleLowerCase().includes(query)))
})
const selectedPoint = computed(() => visiblePoints.value.find(point => point.key === selectedKey.value) ?? visiblePoints.value[0] ?? null)
const markerGroups = computed(() => clusterMapPoints(visiblePoints.value, mapScale.value))
const resultTitle = computed(() => locationMode.value ? '当前位置附近' : '地图点位')
const emptyTitle = computed(() => {
  if (keyword.value || selectedType.value)
    return '未找到匹配点位'
  return locationMode.value ? '当前位置附近暂无已核验点位' : '暂时没有已核验点位'
})

// #ifdef MP-WEIXIN
const miniMarkerGroups = computed(() => markerGroups.value.map((group, index) => ({
  group,
  marker: {
    id: index + 1,
    latitude: group.latitude,
    longitude: group.longitude,
    title: group.title,
    callout: group.pointKey && selectedPoint.value?.key === group.pointKey
      ? { content: group.title, color: '#172322', fontSize: 12, borderRadius: 6, bgColor: '#ffffff', padding: 6, display: 'ALWAYS' }
      : undefined,
  } satisfies MiniMarker,
})))
const miniProgramMarkers = computed(() => miniMarkerGroups.value.map(item => item.marker))
// #endif

// #ifdef H5
function markerGeometries() {
  if (!TMap)
    return []
  const geometries = markerGroups.value.map(group => ({
    id: group.id,
    position: new TMap!.LatLng(group.latitude, group.longitude),
    properties: { title: group.title },
  }))
  if (currentLocation.value) {
    geometries.push({
      id: currentLocationMarkerId,
      position: new TMap.LatLng(currentLocation.value.latitude, currentLocation.value.longitude),
      properties: { title: '当前位置' },
    })
  }
  return geometries
}

function clearH5UserViewportIntent() {
  h5UserViewportIntent = false
  if (h5ViewportIntentTimer)
    clearTimeout(h5ViewportIntentTimer)
}

function beginH5UserViewportIntent() {
  clearH5UserViewportIntent()
  h5UserViewportIntent = true
}

function endH5UserViewportIntent() {
  if (h5ViewportIntentTimer)
    clearTimeout(h5ViewportIntentTimer)
  h5ViewportIntentTimer = setTimeout(() => {
    h5UserViewportIntent = false
  }, 500)
}

function registerH5ViewportIntent(container: HTMLElement) {
  h5MapContainer = container
  container.addEventListener('pointerdown', beginH5UserViewportIntent, true)
  container.addEventListener('pointerup', endH5UserViewportIntent, true)
  container.addEventListener('pointercancel', endH5UserViewportIntent, true)
  container.addEventListener('wheel', beginH5UserViewportIntent, { capture: true, passive: true })
  container.addEventListener('wheel', endH5UserViewportIntent, { capture: true, passive: true })
}

function unregisterH5ViewportIntent() {
  h5MapContainer?.removeEventListener('pointerdown', beginH5UserViewportIntent, true)
  h5MapContainer?.removeEventListener('pointerup', endH5UserViewportIntent, true)
  h5MapContainer?.removeEventListener('pointercancel', endH5UserViewportIntent, true)
  h5MapContainer?.removeEventListener('wheel', beginH5UserViewportIntent, true)
  h5MapContainer?.removeEventListener('wheel', endH5UserViewportIntent, true)
  h5MapContainer = null
  clearH5UserViewportIntent()
}
// #endif

function centerMap(latitude: number, longitude: number, scale: number) {
  mapCenter.value = { latitude, longitude }
  mapScale.value = scale
  // #ifdef H5
  if (map && TMap) {
    clearH5UserViewportIntent()
    map.setCenter(new TMap.LatLng(latitude, longitude))
    map.setZoom(scale)
  }
  // #endif
}

function selectPoint(point: MapPoint, scale = 15) {
  selectedKey.value = point.key
  centerMap(point.latitude, point.longitude, scale)
}

function selectMarkerGroup(groupId: string) {
  const group = markerGroups.value.find(item => item.id === groupId)
  if (!group)
    return
  const point = group.pointKey ? visiblePoints.value.find(item => item.key === group.pointKey) : undefined
  if (point)
    selectPoint(point)
  else
    centerMap(group.latitude, group.longitude, Math.min(mapScale.value + 2, 18))
}

type LoadStatus = 'success' | 'failed' | 'stale'

async function loadResult(
  request: () => Promise<{ points: MapPoint[], meta: Awaited<ReturnType<typeof getMapPoints>>['meta'] }>,
  preserveOnFailure = false,
): Promise<LoadStatus> {
  const generation = requestGate.begin()
  loading.value = !hasLoadedOnce.value
  failed.value = false
  try {
    const result = await request()
    if (!requestGate.isCurrent(generation))
      return 'stale'
    const mode = markerDisplayMode(result.points.length, result.meta.has_more)
    tooMany.value = mode === 'too_many'
    if (mode === 'too_many') {
      points.value = []
      selectedKey.value = ''
      return 'success'
    }
    points.value = result.points
    const nextSelected = points.value.find(point => point.key === selectedKey.value) ?? points.value[0]
    selectedKey.value = nextSelected?.key ?? ''
    if (nextSelected && !hasInitializedCenter.value) {
      centerMap(nextSelected.latitude, nextSelected.longitude, 12)
      hasInitializedCenter.value = true
    }
    return 'success'
  }
  catch {
    if (!requestGate.isCurrent(generation))
      return 'stale'
    failed.value = !preserveOnFailure
    return 'failed'
  }
  finally {
    if (requestGate.isCurrent(generation)) {
      hasLoadedOnce.value = true
      loading.value = false
    }
  }
}

function loadPoints(params: Parameters<typeof getMapPoints>[0]) {
  return loadResult(() => getMapPoints(params))
}

function loadNearbyAnchor(anchorType: MapAnchorType, anchorId: number) {
  return loadResult(() => getNearbyMapPoints(anchorType, anchorId))
}

function loadNearbyLocation(location: LocationCoordinate, preserveOnFailure = false) {
  const query = keyword.value.trim()
  return loadResult(() => getNearbyCenterMapPoints(location, {
    types: selectedType.value ? [selectedType.value] : undefined,
    keyword: query || undefined,
  }), preserveOnFailure)
}

function locationQuerySignature() {
  return `${selectedType.value}\n${keyword.value.trim()}`
}

function clearLocationTimeout(generation: number) {
  if (locationTimeout?.generation !== generation)
    return
  clearTimeout(locationTimeout.handle)
  locationTimeout = undefined
}

function loadBounds(bounds: Bounds) {
  return loadPoints({ mode: 'bbox', ...bounds, limit: 200 })
}

function scheduleBounds(bounds: Bounds) {
  currentViewportBounds = { ...bounds }
  if (anchorMode.value)
    return
  if (locating.value) {
    const generation = locationRequestGeneration
    locationRequestGeneration += 1
    locating.value = false
    clearLocationTimeout(generation)
  }
  anchorMode.value = false
  locationMode.value = false
  locationMessage.value = ''
  requestGate.invalidate()
  if (nearbyFilterTimer)
    clearTimeout(nearbyFilterTimer)
  if (boundsTimer)
    clearTimeout(boundsTimer)
  boundsTimer = setTimeout(() => loadBounds(bounds), 300)
}

function loadCurrentViewport() {
  anchorMode.value = false
  locationMode.value = false
  return loadBounds(currentViewportBounds)
}

// #ifdef H5
function currentH5Bounds(): Bounds | null {
  const bounds = map?.getBounds?.()
  const southWest = bounds?.getSouthWest?.()
  const northEast = bounds?.getNorthEast?.()
  return southWest && northEast
    ? { south: southWest.lat, west: southWest.lng, north: northEast.lat, east: northEast.lng }
    : null
}

async function initializeMap() {
  try {
    TMap = await loadTencentMap(import.meta.env.VITE_QQ_MAP_KEY ?? '')
    await nextTick()
    const container = document.getElementById('travel-map')
    if (!container)
      throw new Error('Map container is unavailable')
    registerH5ViewportIntent(container)
    map = new TMap.Map(container, { center: new TMap.LatLng(mapCenter.value.latitude, mapCenter.value.longitude), zoom: mapScale.value })
    markers = new TMap.MultiMarker({ map, geometries: markerGeometries() })
    markers.on('click', event => event.geometry?.id && selectMarkerGroup(event.geometry.id))
    map.on?.('bounds_changed', () => {
      const bounds = currentH5Bounds()
      if (!bounds)
        return
      currentViewportBounds = bounds
      if (h5UserViewportIntent)
        scheduleBounds(bounds)
    })
  }
  catch {
    mapFailed.value = true
  }
}
// #endif

async function load(query?: Record<string, string | undefined>) {
  const anchorId = Number(query?.anchor_id)
  const anchorType = query?.anchor_type as MapAnchorType | undefined
  anchorMode.value = Boolean(anchorType && Number.isInteger(anchorId) && anchorId > 0)
  locationMode.value = false
  await (anchorMode.value
    ? loadNearbyAnchor(anchorType, anchorId)
    : loadBounds(defaultBounds))
  // #ifdef H5
  if (!failed.value)
    await initializeMap()
  // #endif
}

function finishLocationFailure(generation: number, message = '未获取定位，仍可浏览当前地图') {
  if (generation !== locationRequestGeneration)
    return
  clearLocationTimeout(generation)
  locationRequestGeneration += 1
  locating.value = false
  locationMessage.value = message
}

function locateMe() {
  if (locating.value)
    return
  if (boundsTimer)
    clearTimeout(boundsTimer)
  if (nearbyFilterTimer)
    clearTimeout(nearbyFilterTimer)
  const generation = ++locationRequestGeneration
  locating.value = true
  locationMessage.value = ''
  locationTimeout = {
    generation,
    handle: setTimeout(() => finishLocationFailure(generation, '定位超时，仍可浏览当前地图'), 10000),
  }
  try {
    requestCurrentLocation(async ({ latitude, longitude }) => {
      if (generation !== locationRequestGeneration)
        return
      clearLocationTimeout(generation)
      let location: LocationCoordinate
      try {
        location = normalizeLocationCoordinate(latitude, longitude, currentLocationCoordinateSystem)
      }
      catch {
        finishLocationFailure(generation)
        return
      }
      let status: LoadStatus
      let querySignature: string
      for (;;) {
        querySignature = locationQuerySignature()
        status = await loadNearbyLocation(location, true)
        if (
          generation !== locationRequestGeneration
          || status !== 'success'
          || querySignature === locationQuerySignature()
        ) {
          break
        }
      }
      if (generation !== locationRequestGeneration)
        return
      if (status === 'stale') {
        locating.value = false
        return
      }
      if (status === 'failed') {
        finishLocationFailure(generation, '附近点位暂时无法加载，仍可浏览当前地图')
        return
      }
      locating.value = false
      hasLocated.value = true
      currentLocation.value = location
      anchorMode.value = false
      locationMode.value = true
      locationMessage.value = '已显示当前位置附近'
      centerMap(location.latitude, location.longitude, 14)
    }, () => {
      if (generation !== locationRequestGeneration)
        return
      clearLocationTimeout(generation)
      finishLocationFailure(generation)
    })
  }
  catch {
    clearLocationTimeout(generation)
    finishLocationFailure(generation)
  }
}

// #ifdef MP-WEIXIN
function selectMiniProgramMarker(event: { detail: { markerId: number | string } }) {
  const markerId = Number(event.detail.markerId)
  const group = miniMarkerGroups.value.find(item => item.marker.id === markerId)?.group
  if (group)
    selectMarkerGroup(group.id)
}

function handleRegionChange(event: { type?: string, causedBy?: string, detail?: { region?: { southwest?: { latitude: number, longitude: number }, northeast?: { latitude: number, longitude: number } } } }) {
  if (!isUserMapRegionChange(event.type, event.causedBy))
    return
  const southWest = event.detail?.region?.southwest
  const northEast = event.detail?.region?.northeast
  if (southWest && northEast)
    scheduleBounds({ south: southWest.latitude, west: southWest.longitude, north: northEast.latitude, east: northEast.longitude })
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
    uni.openLocation({ latitude: point.latitude, longitude: point.longitude, name: point.name, address: point.address ?? '' })
  }
  // #endif
  // #ifdef MP-WEIXIN
  uni.openLocation({ latitude: point.latitude, longitude: point.longitude, name: point.name, address: point.address ?? '' })
  // #endif
}

function resetFilters() {
  keyword.value = ''
  selectedType.value = ''
}

watch(markerGroups, () => {
  // #ifdef H5
  markers?.setGeometries(markerGeometries())
  // #endif
})
watch(currentLocation, () => {
  // #ifdef H5
  markers?.setGeometries(markerGeometries())
  // #endif
})
watch([selectedType, keyword], () => {
  if (locating.value || !locationMode.value || !currentLocation.value)
    return
  if (nearbyFilterTimer)
    clearTimeout(nearbyFilterTimer)
  nearbyFilterTimer = setTimeout(async () => {
    if (!locationMode.value || !currentLocation.value)
      return
    const status = await loadNearbyLocation(currentLocation.value, true)
    if (status === 'failed')
      locationMessage.value = '附近点位暂时无法更新，仍可浏览当前结果'
  }, 300)
})
onLoad(query => load(query as Record<string, string | undefined>))
onBeforeUnmount(() => {
  locationRequestGeneration += 1
  requestGate.invalidate()
  if (boundsTimer)
    clearTimeout(boundsTimer)
  if (nearbyFilterTimer)
    clearTimeout(nearbyFilterTimer)
  if (locationTimeout)
    clearLocationTimeout(locationTimeout.generation)
  // #ifdef H5
  unregisterH5ViewportIntent()
  markers?.setMap(null)
  map?.destroy?.()
  // #endif
})
</script>

<template>
  <view class="page">
    <view class="page-content">
      <view class="toolbar">
        <wd-search v-model="keyword" placeholder="搜索名称或地址" variant="light" hide-cancel :maxlength="120" />
        <view class="filters">
          <view class="filter-row">
            <view v-for="filter in filters" :key="filter.value || 'all'" class="filter-option" :class="{ active: selectedType === filter.value }" @click="selectedType = filter.value">
              {{ filter.label }}
            </view>
          </view>
        </view>
      </view>
      <view v-if="loading" class="state-shell">
        <PublicState kind="loading" title="正在加载西昌点位" />
      </view>
      <view v-else-if="failed" class="state-shell">
        <PublicState kind="network-error" title="地图点位暂时无法加载" action-text="重新加载" @action="load" />
      </view>
      <template v-else>
        <view class="result-heading">
          <text class="result-title">{{ resultTitle }}</text><text class="result-count">{{ visiblePoints.length }} 处</text>
        </view>
        <view class="map-shell">
          <!-- #ifdef H5 -->
          <view id="travel-map" class="map-canvas" />
          <wd-button class="locate-button" size="small" icon="position" :loading="locating" @click="locateMe">
            定位
          </wd-button>
          <!-- #endif -->
          <!-- #ifdef MP-WEIXIN -->
          <map id="travel-map-native" class="map-canvas" :latitude="mapCenter.latitude" :longitude="mapCenter.longitude" :scale="mapScale" :markers="miniProgramMarkers" :show-location="hasLocated" @markertap="selectMiniProgramMarker" @regionchange="handleRegionChange" @error="mapFailed = true"><cover-view class="native-locate-button" @click.stop="locateMe">{{ locating ? '定位中' : '定位' }}</cover-view></map>
          <!-- #endif -->
          <view v-if="mapFailed" class="map-fallback">
            <wd-icon name="location" size="34" /><text>地图画布未能加载</text><text>仍可使用下方点位列表</text>
          </view>
        </view>
        <view v-if="tooMany" class="notice">
          <wd-icon name="warning" /><text>当前范围点位过多，请放大地图缩小范围</text><wd-button v-if="anchorMode" size="small" variant="text" @click="loadCurrentViewport">
            按当前视野加载
          </wd-button>
        </view>
        <view v-if="locationMessage" class="notice">
          <text>{{ locationMessage }}</text>
        </view>
        <view v-if="selectedPoint" class="selected-place">
          <view>
            <text class="type-label">{{ selectedPoint.typeName }}</text><view class="selected-name">
              {{ selectedPoint.name }}
            </view><view v-if="selectedPoint.address" class="muted">
              {{ selectedPoint.address }}
            </view>
          </view>
          <view class="actions">
            <wd-button size="small" variant="text" @click="openDetail(selectedPoint)">
              详情
            </wd-button><wd-button size="small" icon="navigation" @click="navigate(selectedPoint)">
              导航
            </wd-button>
          </view>
        </view>
        <view v-if="!visiblePoints.length && !tooMany" class="state-shell">
          <PublicState :kind="keyword || selectedType ? 'filtered-empty' : 'initial-empty'" :title="emptyTitle" :action-text="keyword || selectedType ? '重置筛选' : ''" @action="resetFilters" />
        </view>
        <view v-else class="point-list">
          <view v-for="point in visiblePoints" :key="point.key" class="point" :class="{ selected: selectedPoint?.key === point.key }" @click="selectPoint(point)">
            <view>
              <text class="type-label">{{ point.typeName }}</text><view class="point-name">
                {{ point.name }}
              </view><view class="muted">
                {{ point.address || '地址以详情为准' }}
              </view>
            </view><text v-if="point.distance_meters !== null" class="distance">约 {{ point.distance_meters }} 米</text>
          </view>
        </view>
      </template>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: var(--lx-color-surface-muted);
}
.page-content {
  width: 100%;
  max-width: var(--lx-page-max);
  min-height: 100vh;
  margin: 0 auto;
  padding: 24rpx var(--lx-space-page) calc(72rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}
.toolbar {
  background: var(--lx-color-surface);
  border-bottom: 1px solid var(--lx-color-border);
}
.filters {
  width: 100%;
  margin-top: 12rpx;
}
.filter-row {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 8rpx;
  padding-bottom: 14rpx;
}
.filter-option {
  min-width: 0;
  padding: 11rpx 6rpx;
  color: var(--lx-color-text-tertiary);
  border-radius: 6px;
  white-space: nowrap;
  text-align: center;
}
.filter-option.active {
  color: #fff;
  background: var(--lx-color-primary);
}
.state-shell {
  min-height: 260rpx;
  padding: 32rpx 0;
}
.result-heading {
  display: flex;
  justify-content: space-between;
  padding: 22rpx 0 14rpx;
}
.result-title {
  font-size: 30rpx;
  font-weight: 650;
}
.result-count,
.muted,
.distance {
  color: var(--lx-color-text-tertiary);
  font-size: 23rpx;
}
.map-shell {
  position: relative;
  height: min(620rpx, 52vh);
  min-height: 420rpx;
  overflow: hidden;
  border-radius: 8px;
  background: #dfe9e6;
}
.map-canvas {
  width: 100%;
  height: 100%;
}
.locate-button,
.native-locate-button {
  position: absolute;
  z-index: 1001;
  right: 20rpx;
  bottom: 20rpx;
}
.native-locate-button {
  padding: 12rpx 18rpx;
  background: #fff;
  border-radius: 6px;
}
.map-fallback {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  background: var(--lx-color-surface-muted);
}
.notice {
  display: flex;
  gap: 10rpx;
  align-items: center;
  margin-top: 16rpx;
  padding: 18rpx;
  color: var(--lx-color-text-secondary);
  background: #fff7e8;
  border-radius: 6px;
}
.selected-place {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
  margin-top: 18rpx;
  padding: 22rpx;
  background: var(--lx-color-surface);
  border: 1px solid var(--lx-color-border);
  border-radius: 8px;
}
.selected-name,
.point-name {
  margin-top: 6rpx;
  color: var(--lx-color-text-main);
  font-size: 28rpx;
  font-weight: 620;
}
.type-label {
  color: var(--lx-color-primary-strong);
  font-size: 22rpx;
}
.actions {
  display: flex;
  align-items: center;
  gap: 8rpx;
}
.point-list {
  margin-top: 20rpx;
  border-top: 1px solid var(--lx-color-border-strong);
}
.point {
  display: flex;
  min-height: 112rpx;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
  padding: 20rpx 4rpx;
  border-bottom: 1px solid var(--lx-color-border);
}
.point.selected {
  background: var(--lx-color-surface);
}
@media (max-width: 767px) {
  .filter-row {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
@media (min-width: 768px) {
  .page-content {
    max-width: 1180px;
  }
  .map-shell {
    height: 560px;
  }
}
</style>
