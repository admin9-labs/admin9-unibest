import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { MapPoint } from '@/api/map-points'
import TravelMap from './index.vue'

const mocks = vi.hoisted(() => ({ getMapPoints: vi.fn(), getNearbyMapPoints: vi.fn(), loadTencentMap: vi.fn(), openTencentRoute: vi.fn() }))
vi.mock('@/api/map-points', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/map-points')>()
  return { ...actual, getMapPoints: mocks.getMapPoints, getNearbyMapPoints: mocks.getNearbyMapPoints }
})
vi.mock('@/utils/tencent-map', () => ({ loadTencentMap: mocks.loadTencentMap, openTencentRoute: mocks.openTencentRoute }))
const WdButton = defineComponent({ emits: ['click'], template: '<button @click="$emit(\'click\', $event)"><slot /></button>' })

function mountPage() {
  const wrapper = mount(TravelMap, { global: { stubs: { CoverView: { template: '<div><slot /></div>' }, Map: { template: '<div><slot /></div>' }, WdButton, WdSearch: { template: '<input>' }, WdIcon: true, ScrollView: { template: '<div><slot /></div>' } } } })
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

function result(points: MapPoint[], hasMore = false) {
  return { points, meta: { pagination: 'cursor' as const, next_cursor: null, page_size: 200, has_more: hasMore, mode: 'bbox' as const, coordinate_system: 'GCJ-02' as const, distance_mode: null } }
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.clearAllMocks()
})

describe('travel map page', () => {
  it('loads the unified bbox, opens detail and navigation, and locates in GCJ-02', async () => {
    const map = { setCenter: vi.fn(), setZoom: vi.fn(), destroy: vi.fn(), on: vi.fn() }
    const marker = { on: vi.fn(), setGeometries: vi.fn(), setMap: vi.fn() }
    mocks.getMapPoints.mockResolvedValue(result([point()]))
    mocks.loadTencentMap.mockResolvedValue({ LatLng: vi.fn((lat, lng) => ({ lat, lng })), Map: vi.fn(() => map), MultiMarker: vi.fn(() => marker) })
    vi.mocked(uni.getLocation).mockImplementation(({ success }) => success?.({ latitude: 27.9, longitude: 102.3 } as never))
    const wrapper = mountPage()
    await vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.({})
    await flushPromises()

    expect(mocks.getMapPoints).toHaveBeenCalledWith(expect.objectContaining({ mode: 'bbox', limit: 200 }))
    expect(wrapper.text()).toContain('邛海泸山景区')
    await wrapper.findAll('button').find(button => button.text() === '详情')!.trigger('click')
    expect(uni.navigateTo).toHaveBeenCalledWith({ url: '/pages/attractions/detail?id=101' })
    await wrapper.findAll('button').find(button => button.text() === '导航')!.trigger('click')
    expect(mocks.openTencentRoute).toHaveBeenCalled()
    await wrapper.findAll('button').find(button => button.text() === '定位')!.trigger('click')
    expect(uni.getLocation).toHaveBeenCalledWith(expect.objectContaining({ type: 'gcj02' }))
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
