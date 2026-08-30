import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { MapPoint } from '@/api/map-points'
import { normalizeLocationCoordinate } from '@/utils/location-coordinate'
import TravelMap from './index.vue'

const mocks = vi.hoisted(() => ({ getMapPoints: vi.fn(), getNearbyCenterMapPoints: vi.fn(), getNearbyMapPoints: vi.fn(), loadTencentMap: vi.fn(), openTencentRoute: vi.fn() }))
vi.mock('@/api/map-points', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/map-points')>()
  return { ...actual, getMapPoints: mocks.getMapPoints, getNearbyCenterMapPoints: mocks.getNearbyCenterMapPoints, getNearbyMapPoints: mocks.getNearbyMapPoints }
})
vi.mock('@/utils/tencent-map', () => ({ currentLocationMarkerId: 'current-location', loadTencentMap: mocks.loadTencentMap, openTencentRoute: mocks.openTencentRoute }))
const WdButton = defineComponent({ props: ['loading'], emits: ['click'], template: '<button :data-loading="loading" @click="$emit(\'click\', $event)"><slot /></button>' })
const WdSearch = defineComponent({
  props: ['modelValue'],
  emits: ['update:modelValue'],
  setup(_props, { emit }) {
    return { update: (event: Event) => emit('update:modelValue', (event.target as HTMLInputElement).value) }
  },
  template: '<input class="search-input" :value="modelValue" @input="update">',
})
const originalGeolocation = Object.getOwnPropertyDescriptor(navigator, 'geolocation')

function position(latitude: number, longitude: number): GeolocationPosition {
  return { coords: { latitude, longitude }, timestamp: Date.now() } as GeolocationPosition
}

function mockBrowserLocation(implementation: Geolocation['getCurrentPosition']) {
  const getCurrentPosition = vi.fn(implementation)
  Object.defineProperty(navigator, 'geolocation', {
    configurable: true,
    value: { getCurrentPosition, watchPosition: vi.fn(), clearWatch: vi.fn() },
  })
  return getCurrentPosition
}

function mountPage() {
  const wrapper = mount(TravelMap, { global: { stubs: { CoverView: { template: '<div><slot /></div>' }, Map: { template: '<div><slot /></div>' }, WdButton, WdSearch, WdIcon: true, WdLoading: true, ScrollView: { template: '<div><slot /></div>' } } } })
  vi.spyOn(document, 'getElementById').mockImplementation(id => id === 'travel-map' ? wrapper.find('#travel-map').element as HTMLElement : null)
  return wrapper
}

function point(overrides: Partial<MapPoint> = {}): MapPoint {
  return {
    type: 'attraction',
    id: 101,
    key: 'attraction:101',
    typeName: '景区',
    name: '邛海泸山景区',
    address: '海滨路',
    latitude: 27.86,
    longitude: 102.27,
    coordinate_system: 'GCJ-02',
    map_eligible: true,
    map_ineligible_reason: null,
    detail_url: '/pages/attractions/detail?id=101',
    detailUrl: '/pages/attractions/detail?id=101',
    distance_meters: null,
    distance_mode: null,
    is_directly_related: false,
    route_node_id: null,
    route_node_name: null,
    route_node_type: null,
    route_node_position: null,
    ...overrides,
  }
}

function result(points: MapPoint[], hasMore = false, mode: 'bbox' | 'nearby' = 'bbox') {
  return { points, meta: { pagination: 'cursor' as const, next_cursor: null, page_size: mode === 'bbox' ? 200 : 100, has_more: hasMore, mode, coordinate_system: 'GCJ-02' as const, distance_mode: mode === 'nearby' ? 'straight_line' as const : null } }
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.clearAllMocks()
  vi.useRealTimers()
  if (originalGeolocation)
    Object.defineProperty(navigator, 'geolocation', originalGeolocation)
  else
    delete (navigator as Navigator & { geolocation?: Geolocation }).geolocation
})

describe('travel map page', () => {
  it('loads bbox, opens detail and navigation, then converts H5 location for nearby results and a non-business marker', async () => {
    let markerClick: ((event: { geometry?: { id?: string } }) => void) | undefined
    const map = { setCenter: vi.fn(), setZoom: vi.fn(), destroy: vi.fn(), on: vi.fn() }
    const marker = {
      on: vi.fn((_event: string, listener: typeof markerClick) => {
        markerClick = listener
      }),
      setGeometries: vi.fn(),
      setMap: vi.fn(),
    }
    mocks.getMapPoints.mockResolvedValue(result([point()]))
    mocks.getNearbyCenterMapPoints.mockResolvedValue(result([point({ distance_meters: 125, distance_mode: 'straight_line' })], false, 'nearby'))
    mocks.loadTencentMap.mockResolvedValue({ LatLng: vi.fn((lat, lng) => ({ lat, lng })), Map: vi.fn(() => map), MultiMarker: vi.fn(() => marker) })
    const getCurrentPosition = mockBrowserLocation(success => success(position(27.8926, 102.2709)))
    const wrapper = mountPage()
    await vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.({})
    await flushPromises()

    expect(mocks.getMapPoints).toHaveBeenCalledWith(expect.objectContaining({ mode: 'bbox', limit: 200 }))
    expect(wrapper.findAll('.filter-option').map(item => item.text())).toEqual(['全部', '景区', '景点', '餐饮', '住宿', '公共服务', '停车'])
    expect(wrapper.text()).toContain('邛海泸山景区')
    await wrapper.findAll('button').find(button => button.text() === '详情')!.trigger('click')
    expect(uni.navigateTo).toHaveBeenCalledWith({ url: '/pages/attractions/detail?id=101' })
    await wrapper.findAll('button').find(button => button.text() === '导航')!.trigger('click')
    expect(mocks.openTencentRoute).toHaveBeenCalled()
    await wrapper.findAll('button').find(button => button.text() === '定位')!.trigger('click')
    await flushPromises()
    const location = normalizeLocationCoordinate(27.8926, 102.2709, 'WGS84')
    expect(getCurrentPosition).toHaveBeenCalledWith(expect.any(Function), expect.any(Function), { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 })
    expect(uni.getLocation).not.toHaveBeenCalled()
    expect(mocks.getNearbyCenterMapPoints).toHaveBeenCalledWith(location, { types: undefined, keyword: undefined })
    expect(wrapper.text()).toContain('当前位置附近')
    expect(wrapper.text()).toContain('约 125 米')
    expect(wrapper.findAll('.point')).toHaveLength(1)
    expect(marker.setGeometries).toHaveBeenLastCalledWith(expect.arrayContaining([expect.objectContaining({ id: 'current-location' })]))
    markerClick?.({ geometry: { id: 'current-location' } })
    expect(uni.navigateTo).toHaveBeenCalledTimes(1)
  })

  it('does not replace location nearby with bbox during programmatic centering, but user dragging restores viewport browsing', async () => {
    vi.useFakeTimers()
    let boundsChanged: () => void = () => {}
    const map = {
      setCenter: vi.fn(() => boundsChanged()),
      setZoom: vi.fn(() => boundsChanged()),
      getBounds: vi.fn(() => ({
        getSouthWest: () => ({ lat: 27.88, lng: 102.25 }),
        getNorthEast: () => ({ lat: 27.90, lng: 102.29 }),
      })),
      on: vi.fn((_event: string, callback: () => void) => { boundsChanged = callback }),
    }
    mocks.getMapPoints.mockResolvedValueOnce(result([point()])).mockResolvedValue(result([point({ id: 202, key: 'attraction:202', name: '当前视野点位' })]))
    mocks.getNearbyCenterMapPoints.mockResolvedValue(result([point({ distance_meters: 80, distance_mode: 'straight_line' })], false, 'nearby'))
    mocks.loadTencentMap.mockResolvedValue({ LatLng: vi.fn((lat, lng) => ({ lat, lng })), Map: vi.fn(() => map), MultiMarker: vi.fn(() => ({ on: vi.fn(), setGeometries: vi.fn(), setMap: vi.fn() })) })
    mockBrowserLocation(success => success(position(27.8926, 102.2709)))
    const wrapper = mountPage()
    await vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.({})
    await flushPromises()

    await wrapper.findAll('button').find(button => button.text() === '定位')!.trigger('click')
    await flushPromises()
    expect(mocks.getMapPoints).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toContain('当前位置附近')

    wrapper.get('#travel-map').element.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    boundsChanged()
    vi.advanceTimersByTime(300)
    await flushPromises()
    expect(mocks.getMapPoints).toHaveBeenCalledTimes(2)
    expect(mocks.getMapPoints).toHaveBeenLastCalledWith(expect.objectContaining({ mode: 'bbox', south: 27.88, west: 102.25, north: 27.90, east: 102.29 }))
    expect(wrapper.text()).toContain('地图点位')
    expect(wrapper.text()).toContain('当前视野点位')
  })

  it('reuses the current center for type, keyword, and repeated location requests', async () => {
    vi.useFakeTimers()
    const locations = [
      { latitude: 27.8926, longitude: 102.2709 },
      { latitude: 27.8297, longitude: 102.2669 },
    ]
    mocks.getMapPoints.mockResolvedValue(result([point({ type: 'restaurant', typeName: '餐饮' })]))
    mocks.getNearbyCenterMapPoints.mockResolvedValue(result([point({ type: 'restaurant', typeName: '餐饮', distance_meters: 100, distance_mode: 'straight_line' })], false, 'nearby'))
    mocks.loadTencentMap.mockRejectedValue(new Error('missing key'))
    mockBrowserLocation((success) => {
      const location = locations.shift()!
      success(position(location.latitude, location.longitude))
    })
    const wrapper = mountPage()
    await vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.({})
    await flushPromises()

    await wrapper.findAll('button').find(button => button.text() === '定位')!.trigger('click')
    await flushPromises()
    await wrapper.findAll('.filter-option').find(item => item.text() === '餐饮')!.trigger('click')
    vi.advanceTimersByTime(300)
    await flushPromises()
    expect(mocks.getNearbyCenterMapPoints).toHaveBeenLastCalledWith(expect.any(Object), { types: ['restaurant'], keyword: undefined })

    await wrapper.get('.search-input').setValue('古城')
    vi.advanceTimersByTime(300)
    await flushPromises()
    expect(mocks.getNearbyCenterMapPoints).toHaveBeenLastCalledWith(expect.any(Object), { types: ['restaurant'], keyword: '古城' })

    await wrapper.findAll('button').find(button => button.text() === '定位')!.trigger('click')
    await flushPromises()
    expect(mocks.getNearbyCenterMapPoints).toHaveBeenLastCalledWith(
      normalizeLocationCoordinate(27.8297, 102.2669, 'WGS84'),
      { types: ['restaurant'], keyword: '古城' },
    )
  })

  it('keeps a repeated location timeout active when filters change before the provider responds', async () => {
    vi.useFakeTimers()
    let request = 0
    mockBrowserLocation((success) => {
      request += 1
      if (request === 1)
        success(position(27.8926, 102.2709))
    })
    mocks.getMapPoints.mockResolvedValue(result([point()]))
    mocks.getNearbyCenterMapPoints.mockResolvedValue(result([point({ distance_meters: 100, distance_mode: 'straight_line' })], false, 'nearby'))
    mocks.loadTencentMap.mockRejectedValue(new Error('missing key'))
    const wrapper = mountPage()
    await vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.({})
    await flushPromises()
    const locate = () => wrapper.findAll('button').find(button => button.text() === '定位')!.trigger('click')
    await locate()
    await flushPromises()
    await locate()
    await wrapper.findAll('.filter-option').find(item => item.text() === '餐饮')!.trigger('click')
    vi.advanceTimersByTime(10000)
    await flushPromises()

    expect(wrapper.text()).toContain('定位超时，仍可浏览当前地图')
    expect(wrapper.findAll('button').find(button => button.text() === '定位')!.attributes('data-loading')).toBe('false')
    expect(mocks.getNearbyCenterMapPoints).toHaveBeenCalledTimes(1)
  })

  it('uses the new center and latest filters when they change during a repeated location query', async () => {
    const locations = [
      position(27.8926, 102.2709),
      position(27.8297, 102.2669),
    ]
    let resolveSecond: (value: ReturnType<typeof result>) => void = () => {}
    const secondResponse = new Promise<ReturnType<typeof result>>((resolve) => {
      resolveSecond = resolve
    })
    mockBrowserLocation(success => success(locations.shift()!))
    mocks.getMapPoints.mockResolvedValue(result([point()]))
    mocks.getNearbyCenterMapPoints
      .mockResolvedValueOnce(result([point({ distance_meters: 100, distance_mode: 'straight_line' })], false, 'nearby'))
      .mockReturnValueOnce(secondResponse)
      .mockResolvedValueOnce(result([point({ type: 'restaurant', typeName: '餐饮', name: '古城新中心筛选结果', distance_meters: 75, distance_mode: 'straight_line' })], false, 'nearby'))
    mocks.loadTencentMap.mockRejectedValue(new Error('missing key'))
    const wrapper = mountPage()
    await vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.({})
    await flushPromises()
    const locate = () => wrapper.findAll('button').find(button => button.text() === '定位')!.trigger('click')
    await locate()
    await flushPromises()
    await locate()
    await flushPromises()

    await wrapper.findAll('.filter-option').find(item => item.text() === '餐饮')!.trigger('click')
    await wrapper.get('.search-input').setValue('古城')
    resolveSecond(result([point({ name: '新中心旧条件结果', distance_meters: 60, distance_mode: 'straight_line' })], false, 'nearby'))
    await flushPromises()

    const newCenter = normalizeLocationCoordinate(27.8297, 102.2669, 'WGS84')
    expect(mocks.getNearbyCenterMapPoints).toHaveBeenCalledTimes(3)
    expect(mocks.getNearbyCenterMapPoints).toHaveBeenLastCalledWith(newCenter, { types: ['restaurant'], keyword: '古城' })
    expect(wrapper.text()).toContain('古城新中心筛选结果')
    expect(wrapper.text()).not.toContain('新中心旧条件结果')
  })

  it('cancels a pending bbox debounce when location becomes the latest user intent', async () => {
    vi.useFakeTimers()
    let boundsChanged: () => void = () => {}
    const map = {
      setCenter: vi.fn(),
      setZoom: vi.fn(),
      getBounds: vi.fn(() => ({
        getSouthWest: () => ({ lat: 27.82, lng: 102.25 }),
        getNorthEast: () => ({ lat: 27.85, lng: 102.29 }),
      })),
      on: vi.fn((_event: string, callback: () => void) => { boundsChanged = callback }),
    }
    mockBrowserLocation(success => success(position(27.8926, 102.2709)))
    mocks.getMapPoints.mockResolvedValue(result([point()]))
    mocks.getNearbyCenterMapPoints.mockResolvedValue(result([point({ name: '最新定位结果', distance_meters: 80, distance_mode: 'straight_line' })], false, 'nearby'))
    mocks.loadTencentMap.mockResolvedValue({ LatLng: vi.fn((lat, lng) => ({ lat, lng })), Map: vi.fn(() => map), MultiMarker: vi.fn(() => ({ on: vi.fn(), setGeometries: vi.fn(), setMap: vi.fn() })) })
    const wrapper = mountPage()
    await vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.({})
    await flushPromises()

    wrapper.get('#travel-map').element.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    boundsChanged()
    await wrapper.findAll('button').find(button => button.text() === '定位')!.trigger('click')
    await flushPromises()
    vi.advanceTimersByTime(300)
    await flushPromises()

    expect(mocks.getMapPoints).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toContain('当前位置附近')
    expect(wrapper.text()).toContain('最新定位结果')
  })

  it('keeps existing results after permission failure, invalid coordinates, and timeout', async () => {
    vi.useFakeTimers()
    mocks.getMapPoints.mockResolvedValue(result([point()]))
    mocks.loadTencentMap.mockRejectedValue(new Error('missing key'))
    let request = 0
    mockBrowserLocation((success, fail) => {
      request += 1
      if (request === 1) {
        fail?.({ code: 1, message: 'Permission denied', PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 } as GeolocationPositionError)
      }
      else if (request === 2) {
        success(position(Number.NaN, 102.2))
      }
    })
    const wrapper = mountPage()
    await vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.({})
    await flushPromises()

    const locate = () => wrapper.findAll('button').find(button => button.text() === '定位')!.trigger('click')
    await locate()
    expect(wrapper.text()).toContain('未获取定位，仍可浏览当前地图')
    expect(wrapper.text()).toContain('邛海泸山景区')
    await locate()
    expect(wrapper.text()).toContain('未获取定位，仍可浏览当前地图')
    await locate()
    vi.advanceTimersByTime(10000)
    await flushPromises()
    expect(wrapper.text()).toContain('定位超时，仍可浏览当前地图')
    expect(wrapper.findAll('.point')).toHaveLength(1)
  })

  it('keeps the map mounted so an empty location can be filtered, relocated, and dragged back to bbox', async () => {
    vi.useFakeTimers()
    let boundsChanged: () => void = () => {}
    const map = {
      setCenter: vi.fn(),
      setZoom: vi.fn(),
      getBounds: vi.fn(() => ({
        getSouthWest: () => ({ lat: 27.82, lng: 102.25 }),
        getNorthEast: () => ({ lat: 27.85, lng: 102.29 }),
      })),
      on: vi.fn((_event: string, callback: () => void) => { boundsChanged = callback }),
    }
    mocks.getMapPoints.mockResolvedValueOnce(result([point()])).mockResolvedValue(result([point({ id: 606, key: 'attraction:606', name: '空态拖动结果' })]))
    mocks.getNearbyCenterMapPoints.mockResolvedValue(result([], false, 'nearby'))
    mocks.loadTencentMap.mockResolvedValue({ LatLng: vi.fn((lat, lng) => ({ lat, lng })), Map: vi.fn(() => map), MultiMarker: vi.fn(() => ({ on: vi.fn(), setGeometries: vi.fn(), setMap: vi.fn() })) })
    mockBrowserLocation(success => success(position(27.8926, 102.2709)))
    const wrapper = mountPage()
    await vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.({})
    await flushPromises()
    await wrapper.findAll('button').find(button => button.text() === '定位')!.trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('当前位置附近暂无已核验点位')
    expect(wrapper.text()).toContain('0 处')
    expect(wrapper.find('#travel-map').exists()).toBe(true)

    await wrapper.findAll('.filter-option').find(item => item.text() === '停车')!.trigger('click')
    vi.advanceTimersByTime(300)
    await flushPromises()
    expect(wrapper.find('#travel-map').exists()).toBe(true)
    await wrapper.findAll('.filter-option').find(item => item.text() === '全部')!.trigger('click')
    vi.advanceTimersByTime(300)
    await flushPromises()
    await wrapper.findAll('button').find(button => button.text() === '定位')!.trigger('click')
    await flushPromises()
    expect(wrapper.find('#travel-map').exists()).toBe(true)

    wrapper.get('#travel-map').element.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    boundsChanged()
    vi.advanceTimersByTime(300)
    await flushPromises()
    expect(wrapper.text()).toContain('地图点位')
    expect(wrapper.text()).toContain('空态拖动结果')
  })

  it('ignores a late location response after the user switches to a newer viewport request', async () => {
    vi.useFakeTimers()
    let boundsChanged: () => void = () => {}
    let resolveLocation: (value: ReturnType<typeof result>) => void = () => {}
    const locationResponse = new Promise<ReturnType<typeof result>>((resolve) => {
      resolveLocation = resolve
    })
    const map = {
      setCenter: vi.fn(),
      setZoom: vi.fn(),
      getBounds: vi.fn(() => ({
        getSouthWest: () => ({ lat: 27.82, lng: 102.25 }),
        getNorthEast: () => ({ lat: 27.85, lng: 102.29 }),
      })),
      on: vi.fn((_event: string, callback: () => void) => { boundsChanged = callback }),
    }
    mocks.getMapPoints.mockResolvedValueOnce(result([point()])).mockResolvedValue(result([point({ id: 303, key: 'attraction:303', name: '拖动后的点位' })]))
    mocks.getNearbyCenterMapPoints.mockReturnValue(locationResponse)
    mocks.loadTencentMap.mockResolvedValue({ LatLng: vi.fn((lat, lng) => ({ lat, lng })), Map: vi.fn(() => map), MultiMarker: vi.fn(() => ({ on: vi.fn(), setGeometries: vi.fn(), setMap: vi.fn() })) })
    mockBrowserLocation(success => success(position(27.8926, 102.2709)))
    const wrapper = mountPage()
    await vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.({})
    await flushPromises()
    await wrapper.findAll('button').find(button => button.text() === '定位')!.trigger('click')
    await flushPromises()

    wrapper.get('#travel-map').element.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    boundsChanged()
    vi.advanceTimersByTime(300)
    await flushPromises()
    expect(wrapper.text()).toContain('拖动后的点位')
    expect(wrapper.findAll('button').find(button => button.text() === '定位')!.attributes('data-loading')).toBe('false')

    resolveLocation(result([point({ id: 404, key: 'attraction:404', name: '过期定位点位', distance_meters: 50, distance_mode: 'straight_line' })], false, 'nearby'))
    await flushPromises()
    expect(wrapper.text()).not.toContain('过期定位点位')
    expect(wrapper.text()).toContain('拖动后的点位')
  })

  it('ignores a browser location callback that arrives after the user starts viewport browsing', async () => {
    vi.useFakeTimers()
    let boundsChanged: () => void = () => {}
    let locationSuccess: PositionCallback = () => {}
    mockBrowserLocation((success) => {
      locationSuccess = success
    })
    const map = {
      setCenter: vi.fn(),
      setZoom: vi.fn(),
      getBounds: vi.fn(() => ({
        getSouthWest: () => ({ lat: 27.82, lng: 102.25 }),
        getNorthEast: () => ({ lat: 27.85, lng: 102.29 }),
      })),
      on: vi.fn((_event: string, callback: () => void) => { boundsChanged = callback }),
    }
    mocks.getMapPoints.mockResolvedValueOnce(result([point()])).mockResolvedValue(result([point({ id: 505, key: 'attraction:505', name: '用户视野结果' })]))
    mocks.loadTencentMap.mockResolvedValue({ LatLng: vi.fn((lat, lng) => ({ lat, lng })), Map: vi.fn(() => map), MultiMarker: vi.fn(() => ({ on: vi.fn(), setGeometries: vi.fn(), setMap: vi.fn() })) })
    const wrapper = mountPage()
    await vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.({})
    await flushPromises()
    await wrapper.findAll('button').find(button => button.text() === '定位')!.trigger('click')

    wrapper.get('#travel-map').element.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    boundsChanged()
    vi.advanceTimersByTime(300)
    await flushPromises()
    expect(wrapper.text()).toContain('用户视野结果')
    expect(wrapper.findAll('button').find(button => button.text() === '定位')!.attributes('data-loading')).toBe('false')

    locationSuccess(position(27.8926, 102.2709))
    await flushPromises()
    expect(mocks.getNearbyCenterMapPoints).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('用户视野结果')
  })

  it('does not let an old provider callback clear a newer location timeout', async () => {
    vi.useFakeTimers()
    let boundsChanged: () => void = () => {}
    const providers: Array<{ success: PositionCallback, fail: PositionErrorCallback | null | undefined }> = []
    mockBrowserLocation((success, fail) => {
      providers.push({ success, fail })
    })
    const map = {
      setCenter: vi.fn(),
      setZoom: vi.fn(),
      getBounds: vi.fn(() => ({
        getSouthWest: () => ({ lat: 27.82, lng: 102.25 }),
        getNorthEast: () => ({ lat: 27.85, lng: 102.29 }),
      })),
      on: vi.fn((_event: string, callback: () => void) => { boundsChanged = callback }),
    }
    mocks.getMapPoints.mockResolvedValue(result([point()]))
    mocks.loadTencentMap.mockResolvedValue({ LatLng: vi.fn((lat, lng) => ({ lat, lng })), Map: vi.fn(() => map), MultiMarker: vi.fn(() => ({ on: vi.fn(), setGeometries: vi.fn(), setMap: vi.fn() })) })
    const wrapper = mountPage()
    await vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.({})
    await flushPromises()
    const locate = () => wrapper.findAll('button').find(button => button.text() === '定位')!.trigger('click')
    await locate()

    wrapper.get('#travel-map').element.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    boundsChanged()
    vi.advanceTimersByTime(300)
    await flushPromises()
    await locate()
    expect(providers).toHaveLength(2)

    providers[0].success(position(27.8926, 102.2709))
    vi.advanceTimersByTime(10000)
    await flushPromises()
    expect(wrapper.text()).toContain('定位超时，仍可浏览当前地图')
    expect(wrapper.findAll('button').find(button => button.text() === '定位')!.attributes('data-loading')).toBe('false')
    expect(mocks.getNearbyCenterMapPoints).not.toHaveBeenCalled()
  })

  it('reissues an initial location query when filters change before its response', async () => {
    let resolveFirst: (value: ReturnType<typeof result>) => void = () => {}
    const firstResponse = new Promise<ReturnType<typeof result>>((resolve) => {
      resolveFirst = resolve
    })
    mocks.getMapPoints.mockResolvedValue(result([point()]))
    mocks.getNearbyCenterMapPoints
      .mockReturnValueOnce(firstResponse)
      .mockResolvedValueOnce(result([point({ type: 'restaurant', typeName: '餐饮', name: '古城餐饮结果', distance_meters: 90, distance_mode: 'straight_line' })], false, 'nearby'))
    mocks.loadTencentMap.mockRejectedValue(new Error('missing key'))
    mockBrowserLocation(success => success(position(27.8926, 102.2709)))
    const wrapper = mountPage()
    await vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.({})
    await flushPromises()
    await wrapper.findAll('button').find(button => button.text() === '定位')!.trigger('click')
    await flushPromises()

    await wrapper.findAll('.filter-option').find(item => item.text() === '餐饮')!.trigger('click')
    await wrapper.get('.search-input').setValue('古城')
    resolveFirst(result([point({ name: '旧条件结果', distance_meters: 50, distance_mode: 'straight_line' })], false, 'nearby'))
    await flushPromises()

    expect(mocks.getNearbyCenterMapPoints).toHaveBeenCalledTimes(2)
    expect(mocks.getNearbyCenterMapPoints).toHaveBeenLastCalledWith(expect.any(Object), { types: ['restaurant'], keyword: '古城' })
    expect(wrapper.text()).toContain('古城餐饮结果')
    expect(wrapper.text()).not.toContain('旧条件结果')
    expect(wrapper.text()).toContain('当前位置附近')
  })

  it('uses nearby mode from a detail entry and displays route-node distance metadata', async () => {
    mocks.getNearbyMapPoints.mockResolvedValue(result([point({ type: 'restaurant', key: 'restaurant:301', id: 301, typeName: '餐饮', distance_meters: 280, distance_mode: 'straight_line', route_node_name: '邛海入口' })]))
    mocks.loadTencentMap.mockRejectedValue(new Error('missing key'))
    const wrapper = mountPage()
    await vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.({ anchor_type: 'travel_route', anchor_id: '9' })
    await flushPromises()

    expect(mocks.getNearbyMapPoints).toHaveBeenCalledWith('travel_route', 9)
    expect(wrapper.text()).toContain('约 280 米')
    expect(wrapper.text()).toContain('地图画布未能加载')
  })

  it('does not present a truncated 201-point viewport as complete', async () => {
    mocks.getMapPoints.mockResolvedValue(result(Array.from({ length: 200 }, (_, index) => point({ id: index + 1, key: `attraction:${index + 1}` })), true))
    mocks.loadTencentMap.mockResolvedValue({ LatLng: vi.fn((lat, lng) => ({ lat, lng })), Map: vi.fn(() => ({ setCenter: vi.fn(), setZoom: vi.fn(), on: vi.fn() })), MultiMarker: vi.fn(() => ({ on: vi.fn(), setGeometries: vi.fn(), setMap: vi.fn() })) })
    const wrapper = mountPage()
    await vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.({})
    await flushPromises()

    expect(wrapper.text()).toContain('当前范围点位过多')
    expect(wrapper.findAll('.point')).toHaveLength(0)
  })

  it('clears an oversized anchor result and can return to the current viewport', async () => {
    let boundsChanged: () => void = () => {}
    const map = {
      setCenter: vi.fn(),
      setZoom: vi.fn(),
      getBounds: vi.fn(() => ({
        getSouthWest: () => ({ lat: 27.81, lng: 102.21 }),
        getNorthEast: () => ({ lat: 27.82, lng: 102.22 }),
      })),
      on: vi.fn((_event: string, callback: () => void) => { boundsChanged = callback }),
    }
    mocks.getNearbyMapPoints.mockResolvedValue(result(Array.from({ length: 200 }, (_, index) => point({ id: index + 1, key: `attraction:${index + 1}` })), true))
    mocks.getMapPoints.mockResolvedValue(result([point({ id: 999, key: 'attraction:999', name: '当前视野点位' })]))
    mocks.loadTencentMap.mockResolvedValue({ LatLng: vi.fn((lat, lng) => ({ lat, lng })), Map: vi.fn(() => map), MultiMarker: vi.fn(() => ({ on: vi.fn(), setGeometries: vi.fn(), setMap: vi.fn() })) })
    const wrapper = mountPage()
    await vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.({ anchor_type: 'attraction', anchor_id: '9' })
    await flushPromises()

    expect(wrapper.findAll('.point')).toHaveLength(0)
    boundsChanged()
    expect(mocks.getMapPoints).not.toHaveBeenCalled()
    await wrapper.findAll('button').find(button => button.text() === '按当前视野加载')!.trigger('click')
    await flushPromises()
    expect(mocks.getMapPoints).toHaveBeenCalledWith(expect.objectContaining({ mode: 'bbox', limit: 200, south: 27.81, west: 102.21, north: 27.82, east: 102.22 }))
    expect(wrapper.text()).toContain('当前视野点位')
  })

  it('keeps filtered empty results recoverable', async () => {
    mocks.getMapPoints.mockResolvedValue(result([point()]))
    mocks.loadTencentMap.mockRejectedValue(new Error('missing key'))
    const wrapper = mountPage()
    await vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.({})
    await flushPromises()
    await wrapper.findAll('.filter-option').find(item => item.text() === '停车')!.trigger('click')
    expect(wrapper.text()).toContain('未找到匹配点位')
    await wrapper.findAll('button').find(button => button.text() === '重置筛选')!.trigger('click')
    expect(wrapper.text()).toContain('邛海泸山景区')
  })
})
