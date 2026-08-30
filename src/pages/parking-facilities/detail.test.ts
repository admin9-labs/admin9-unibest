import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import ParkingFacilityDetail from './detail.vue'

const getParkingFacility = vi.hoisted(() => vi.fn())
vi.mock('@/api/parking-facilities', () => ({ getParkingFacility }))
const WdButton = defineComponent({ emits: ['click'], template: '<button @click="$emit(\'click\')"><slot /></button>' })

describe('parking facility detail', () => {
  it('navigates only an eligible verified facility and mounts nearby places', async () => {
    getParkingFacility.mockResolvedValue({ id: 1, name: '建昌古城外围停车场', type: 'parking_lot', summary: '外围停车', description: '现场公示为准', address: '府街', latitude: 27.8944, longitude: 102.2646, coordinate_system: 'GCJ-02', map_eligible: true, map_ineligible_reason: null, opening_hours: '全天', fee_info: '现场公示', phone: '0834-0000000', total_spaces: 120 })
    const wrapper = mount(ParkingFacilityDetail, { global: { stubs: { WdButton, WdIcon: true, WdLoading: true, NearbyPlaces: { props: ['eligible'], template: '<div class="nearby">{{ eligible }}</div>' }, PublicContentBody: true } } })
    vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.({ id: '1' })
    await flushPromises()
    expect(wrapper.text()).toContain('总车位 120')
    expect(wrapper.get('.nearby').text()).toBe('true')
    await wrapper.findAll('.fact.action')[1].trigger('click')
    expect(uni.openLocation).toHaveBeenCalledWith({ latitude: 27.8944, longitude: 102.2646, name: '建昌古城外围停车场', address: '府街' })
  })
})
