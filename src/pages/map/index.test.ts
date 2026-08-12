import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import TravelMap from './index.vue'

const mocks = vi.hoisted(() => ({ getMapPoints: vi.fn(), loadTencentMap: vi.fn(), openTencentRoute: vi.fn() }))
vi.mock('@/api/map-points', () => ({ getMapPoints: mocks.getMapPoints }))
vi.mock('@/utils/tencent-map', () => ({ loadTencentMap: mocks.loadTencentMap, openTencentRoute: mocks.openTencentRoute }))
const WdButton = defineComponent({ emits: ['click'], template: '<button @click="$emit(\'click\', $event)"><slot /></button>' })

function mountPage() {
  return mount(TravelMap, { global: { stubs: { WdButton, WdSearch: { template: '<input>' }, WdLoading: true, WdEmpty: { props: ['tip'], template: '<div>{{ tip }}<slot name="bottom" /></div>' }, WdIcon: true, WdTag: { template: '<span><slot /></span>' }, ScrollView: { template: '<div><slot /></div>' } } } })
}

function point() {
  return { id: 'attraction:lake', code: 'lake', type: 'attraction', typeName: '景区', name: '邛海泸山景区', address: '海滨路', latitude: 27.86, longitude: 102.27, detailUrl: '/pages/attractions/detail?code=lake' } as const
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
    expect(wrapper.text()).toContain('1 个可导航点位')
    const buttons = wrapper.findAll('button')
    await buttons.find(button => button.text() === '详情')!.trigger('click')
    expect(uni.navigateTo).toHaveBeenCalledWith({ url: '/pages/attractions/detail?code=lake' })
    await buttons.find(button => button.text() === '导航')!.trigger('click')
    expect(mocks.openTencentRoute).toHaveBeenCalledWith(point())
    await buttons.find(button => button.text() === '定位')!.trigger('click')
    expect(uni.getLocation).toHaveBeenCalledWith(expect.objectContaining({ type: 'gcj02' }))
    expect(wrapper.text()).toContain('已定位到当前位置')
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
})
