import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import AccommodationDetail from './detail.vue'

const { getAccommodation } = vi.hoisted(() => ({ getAccommodation: vi.fn() }))
vi.mock('@/api/accommodations', () => ({ getAccommodation }))
const WdButton = defineComponent({ emits: ['click'], template: '<button @click="$emit(\'click\')"><slot /></button>' })

function mountPage() {
  return mount(AccommodationDetail, { global: { stubs: { WdButton, WdLoading: true, WdEmpty: { props: ['tip'], template: '<div>{{ tip }}<slot name="bottom" /></div>' }, WdImg: true, WdIcon: true, WdTag: { template: '<span><slot /></span>' }, WdSwiper: true } } })
}

describe('accommodation detail page', () => {
  it('supports direct loading, facilities, phone, location, and relations', async () => {
    getAccommodation.mockResolvedValueOnce({ code: 'lake-hotel', name: '邛海湖畔酒店', summary: '临湖而居', description: '本地住宿', category: { code: 'hotel', name: '酒店' }, address: '西昌市海滨路', latitude: 27.85, longitude: 102.26, cover: null, gallery: [], phone: '0834-1234567', check_in_time: '14:00', check_out_time: '12:00', reference_price: 398, facilities: ['无线网络'], attraction: { code: 'qionghai', name: '邛海泸山景区' }, scenic_spot: null })
    const wrapper = mountPage()
    vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.({ code: 'lake-hotel' })
    await flushPromises()
    expect(wrapper.text()).toContain('无线网络')
    expect(wrapper.text()).toContain('入住 14:00 · 退房 12:00')
    await wrapper.findAll('.action')[0].trigger('click')
    expect(uni.makePhoneCall).toHaveBeenCalledWith({ phoneNumber: '0834-1234567' })
    await wrapper.findAll('.action')[1].trigger('click')
    expect(uni.openLocation).toHaveBeenCalledWith({ latitude: 27.85, longitude: 102.26, name: '邛海湖畔酒店', address: '西昌市海滨路' })
    await wrapper.get('.related').trigger('click')
    expect(uni.navigateTo).toHaveBeenCalledWith({ url: '/pages/attractions/detail?code=qionghai' })
  })

  it('shows an unavailable state for missing or unpublished records', async () => {
    getAccommodation.mockRejectedValueOnce(Object.assign(new Error('missing'), { statusCode: 404 }))
    const wrapper = mountPage()
    vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.({ code: 'offline' })
    await flushPromises()
    expect(wrapper.text()).toContain('不存在或已停止展示')
    await wrapper.get('button').trigger('click')
    expect(uni.redirectTo).toHaveBeenCalledWith({ url: '/pages/accommodations/index' })
  })
})
