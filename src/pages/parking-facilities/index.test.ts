import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import ParkingFacilityList from './index.vue'

const getParkingFacilities = vi.hoisted(() => vi.fn())
vi.mock('@/api/parking-facilities', () => ({ getParkingFacilities }))
const WdTag = defineComponent({ emits: ['click'], template: '<button @click="$emit(\'click\')"><slot /></button>' })
const WdButton = defineComponent({ props: ['loading'], emits: ['click'], template: '<button @click="$emit(\'click\')"><slot /></button>' })

describe('parking facility list', () => {
  it('lists only API records and supports the two approved types', async () => {
    getParkingFacilities
      .mockResolvedValueOnce({ records: [{ id: 1, name: '建昌古城外围停车场', type: 'parking_lot', summary: '外围停车后步行入城', address: '府街', opening_hours: '以现场公示为准', total_spaces: 120 }], meta: { page: 1, has_more: true } })
      .mockResolvedValueOnce({ records: [{ id: 2, name: '邛海停车点', type: 'parking_point', summary: null, address: '海滨路', opening_hours: null, total_spaces: null }], meta: { page: 2, has_more: false } })
    const wrapper = mount(ParkingFacilityList, { global: { stubs: { WdSearch: true, WdTag, WdIcon: true, WdLoading: true, WdEmpty: true, WdButton, ScrollView: { template: '<div><slot /></div>' } } } })
    await vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.()
    await flushPromises()
    expect(wrapper.text()).toContain('建昌古城外围停车场')
    expect(wrapper.text()).toContain('总车位 120')
    expect(wrapper.text()).not.toContain('实时余位')
    await wrapper.findAll('button').find(button => button.text() === '加载更多')!.trigger('click')
    await flushPromises()
    expect(getParkingFacilities).toHaveBeenLastCalledWith('', undefined, 2)
    expect(wrapper.text()).toContain('邛海停车点')
    await wrapper.get('.item').trigger('click')
    expect(uni.navigateTo).toHaveBeenCalledWith({ url: '/pages/parking-facilities/detail?id=1' })
  })

  it('ignores an old page response after a newer type filter starts', async () => {
    let resolveOldPage: (value: unknown) => void = () => {}
    getParkingFacilities
      .mockResolvedValueOnce({ records: [{ id: 1, name: '旧停车场', type: 'parking_lot' }], meta: { page: 1, has_more: true } })
      .mockImplementationOnce(() => new Promise((resolve) => { resolveOldPage = resolve }))
      .mockResolvedValueOnce({ records: [{ id: 3, name: '新停车点', type: 'parking_point' }], meta: { page: 1, has_more: false } })
    const wrapper = mount(ParkingFacilityList, { global: { stubs: { WdSearch: true, WdTag, WdIcon: true, WdLoading: true, WdEmpty: true, WdButton, ScrollView: { template: '<div><slot /></div>' } } } })
    await vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.()
    await flushPromises()

    await wrapper.findAll('button').find(button => button.text() === '加载更多')!.trigger('click')
    await wrapper.findAll('button').find(button => button.text() === '停车点')!.trigger('click')
    await flushPromises()
    resolveOldPage({ records: [{ id: 2, name: '旧查询第二页', type: 'parking_lot' }], meta: { page: 2, has_more: false } })
    await flushPromises()

    expect(wrapper.text()).toContain('新停车点')
    expect(wrapper.text()).not.toContain('旧查询第二页')
  })
})
