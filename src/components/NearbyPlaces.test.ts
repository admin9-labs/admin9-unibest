import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import NearbyPlaces from './NearbyPlaces.vue'

const getNearbyMapPoints = vi.hoisted(() => vi.fn())
vi.mock('@/api/map-points', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/map-points')>()
  return { ...actual, getNearbyMapPoints }
})
const WdButton = defineComponent({ emits: ['click'], template: '<button @click="$emit(\'click\')"><slot /></button>' })

describe('nearby places', () => {
  it('does not request an ineligible anchor', async () => {
    const wrapper = mount(NearbyPlaces, { props: { anchorType: 'restaurant', anchorId: 1, eligible: false } })
    await flushPromises()
    expect(getNearbyMapPoints).not.toHaveBeenCalled()
    expect(wrapper.html()).toBe('<!--v-if-->')
  })

  it('shows straight-line distance and nearest route node, then opens detail and map', async () => {
    getNearbyMapPoints.mockResolvedValue({ points: [{ key: 'parking_facility:7', type: 'parking_facility', id: 7, typeName: '停车设施', name: '古城外围停车场', address: null, latitude: 27.89, longitude: 102.26, coordinate_system: 'GCJ-02', map_eligible: true, map_ineligible_reason: null, detail_url: '/pages/parking-facilities/detail?id=7', detailUrl: '/pages/parking-facilities/detail?id=7', distance_meters: 850, distance_mode: 'straight_line', is_directly_related: false, route_node_id: 2, route_node_name: '建昌古城', route_node_type: 'scenic_spot', route_node_position: 2 }], meta: {} })
    const wrapper = mount(NearbyPlaces, { props: { anchorType: 'travel_route', anchorId: 9, eligible: true, title: '线路节点周边' }, global: { stubs: { WdButton, WdIcon: true, WdLoading: true } } })
    await flushPromises()
    expect(wrapper.text()).toContain('约 850 米')
    expect(wrapper.text()).toContain('建昌古城')
    await wrapper.find('.nearby-item').trigger('click')
    expect(uni.navigateTo).toHaveBeenCalledWith({ url: '/pages/parking-facilities/detail?id=7' })
    await wrapper.find('button').trigger('click')
    expect(uni.navigateTo).toHaveBeenCalledWith({ url: '/pages/map/index?anchor_type=travel_route&anchor_id=9' })
  })
})
