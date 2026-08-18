import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import TravelMap from './index.vue'

const mocks = vi.hoisted(() => ({ getMapPoints: vi.fn(), loadTencentMap: vi.fn(), openTencentRoute: vi.fn() }))
vi.mock('@/api/map-points', () => ({ getMapPoints: mocks.getMapPoints }))
vi.mock('@/utils/tencent-map', () => ({ loadTencentMap: mocks.loadTencentMap, openTencentRoute: mocks.openTencentRoute }))
const WdButton = defineComponent({ emits: ['click'], template: '<button @click="$emit(\'click\', $event)"><slot /></button>' })

function mountPage() {
  const wrapper = mount(TravelMap, { global: { stubs: { CoverView: { template: '<div><slot /></div>' }, Map: { template: '<div><slot /></div>' }, WdButton, WdSearch: { template: '<input>' }, WdLoading: true, WdEmpty: { props: ['tip'], template: '<div>{{ tip }}<slot name="bottom" /></div>' }, WdIcon: true, WdTag: { template: '<span><slot /></span>' }, ScrollView: { template: '<div><slot /></div>' } } } })
  vi.spyOn(document, 'getElementById').mockImplementation(id => id === 'travel-map' ? wrapper.find('#travel-map').element as HTMLElement : null)
  return wrapper
}

afterEach(() => {
  vi.restoreAllMocks()
})

function point() {
  return { id: 'attraction:101', contentId: 101, type: 'attraction', typeName: '景区', name: '邛海泸山景区', address: '海滨路', latitude: 27.86, longitude: 102.27, detailUrl: '/pages/attractions/detail?id=101' } as const
}

describe('travel map page', () => {
  it('renders real points and connects detail, navigation and location actions', async () => {
    const map = { setCenter: vi.fn(), setZoom: vi.fn(), destroy: vi.fn() }
    const marker = { on: vi.fn(), setGeometries: vi.fn(), setMap: vi.fn() }
    mocks.getMapPoints.mockResolvedValue([point()])
    mocks.loadTencentMap.mockResolvedValue({ LatLng: vi.fn((lat, lng) => ({ lat, lng })), Map: vi.fn(() => map), MultiMarker: vi.fn(() => marker) })
    vi.mocked(uni.getLocation).mockImplementation(({ success }) => success?.({ latitude: 27.9, longitude: 102.3 } as never))
    const wrapper = mountPage()
    await vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.()
    await flushPromises()

    expect(wrapper.text()).toContain('邛海泸山景区')
    expect(wrapper.text()).toContain('1 处')
    const buttons = wrapper.findAll('button')
    await buttons.find(button => button.text() === '查看详情')!.trigger('click')
    expect(uni.navigateTo).toHaveBeenCalledWith({ url: '/pages/attractions/detail?id=101' })
    await buttons.find(button => button.text() === '导航')!.trigger('click')
    expect(mocks.openTencentRoute).toHaveBeenCalledWith(point())
    await buttons.find(button => button.text() === '定位')!.trigger('click')
    expect(uni.getLocation).toHaveBeenCalledWith(expect.objectContaining({ type: 'gcj02' }))
    expect(wrapper.text()).toContain('已定位到当前位置')
  })

  it('uses the Xichang default center when no published content has coordinates', async () => {
    const map = { setCenter: vi.fn(), setZoom: vi.fn(), destroy: vi.fn() }
    const marker = { on: vi.fn(), setGeometries: vi.fn(), setMap: vi.fn() }
    const Map = vi.fn(() => map)
    const LatLng = vi.fn((lat, lng) => ({ lat, lng }))
    mocks.getMapPoints.mockResolvedValue([])
    mocks.loadTencentMap.mockResolvedValue({ LatLng, Map, MultiMarker: vi.fn(() => marker) })

    const wrapper = mountPage()
    await vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.()
    await flushPromises()

    expect(wrapper.text()).toContain('0 处')
    expect(wrapper.text()).toContain('暂时没有可导航点位')
    expect(Map).toHaveBeenCalledWith(expect.anything(), { center: { lat: 27.8945, lng: 102.2644 }, zoom: 12 })
  })

  it('keeps marker selection and the map center aligned', async () => {
    const map = { setCenter: vi.fn(), setZoom: vi.fn(), destroy: vi.fn() }
    let markerClick: ((event: { geometry?: { id?: string } }) => void) | undefined
    const marker = {
      on: vi.fn((event, listener) => {
        if (event === 'click')
          markerClick = listener
      }),
      setGeometries: vi.fn(),
      setMap: vi.fn(),
    }
    const secondPoint = { ...point(), id: 'scenic-spot:201', contentId: 201, type: 'scenic-spot' as const, typeName: '景点', name: '邛海国家湿地公园', latitude: 27.87, longitude: 102.28, detailUrl: '/pages/scenic-spots/detail?id=201' }
    mocks.getMapPoints.mockResolvedValue([point(), secondPoint])
    mocks.loadTencentMap.mockResolvedValue({ LatLng: vi.fn((lat, lng) => ({ lat, lng })), Map: vi.fn(() => map), MultiMarker: vi.fn(() => marker) })

    const wrapper = mountPage()
    await vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.()
    await flushPromises()
    markerClick?.({ geometry: { id: secondPoint.id } })
    await flushPromises()

    const selectedPoint = wrapper.findAll('.point').find(item => item.text().includes(secondPoint.name))
    expect(selectedPoint?.classes()).toContain('selected')
    expect(wrapper.findAll('button').filter(button => button.text() === '查看详情')).toHaveLength(1)
    expect(wrapper.find('.selected-place').text()).toContain(secondPoint.name)
    expect(wrapper.text()).not.toContain('已选')
    expect(wrapper.text()).not.toContain('GCJ-02')
    expect(map.setCenter).toHaveBeenCalledWith({ lat: secondPoint.latitude, lng: secondPoint.longitude })
    expect(map.setZoom).toHaveBeenCalledWith(15)
  })

  it('keeps the point list usable when the map SDK or positioning fails', async () => {
    mocks.getMapPoints.mockResolvedValue([point()])
    mocks.loadTencentMap.mockRejectedValue(new Error('blocked'))
    vi.mocked(uni.getLocation).mockImplementation(({ fail }) => fail?.({ errMsg: 'denied' } as never))
    const wrapper = mountPage()
    await vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.()
    await flushPromises()
    expect(wrapper.text()).toContain('地图画布未能加载')
    expect(wrapper.text()).toContain('邛海泸山景区')
    await wrapper.findAll('button').find(button => button.text() === '定位')!.trigger('click')
    expect(wrapper.text()).toContain('未获取定位')
  })

  it('distinguishes filtered results and resets the existing filters', async () => {
    const map = { setCenter: vi.fn(), setZoom: vi.fn(), destroy: vi.fn() }
    const marker = { on: vi.fn(), setGeometries: vi.fn(), setMap: vi.fn() }
    mocks.getMapPoints.mockResolvedValue([point()])
    mocks.loadTencentMap.mockResolvedValue({ LatLng: vi.fn((lat, lng) => ({ lat, lng })), Map: vi.fn(() => map), MultiMarker: vi.fn(() => marker) })

    const wrapper = mountPage()
    await vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.()
    await flushPromises()
    await wrapper.findAll('.filter-option').find(item => item.text() === '住宿')!.trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('未找到匹配的点位')

    await wrapper.findAll('button').find(button => button.text() === '重置筛选')!.trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('邛海泸山景区')
  })
})
