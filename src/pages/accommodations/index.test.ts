import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import AccommodationList from './index.vue'

const { getAccommodations } = vi.hoisted(() => ({ getAccommodations: vi.fn() }))
vi.mock('@/api/accommodations', () => ({ getAccommodations }))
const WdButton = defineComponent({ emits: ['click'], template: '<button @click="$emit(\'click\')"><slot /></button>' })
const WdTag = defineComponent({ emits: ['click'], template: '<button @click="$emit(\'click\')"><slot /></button>' })

function mountPage() {
  return mount(AccommodationList, { global: { stubs: { WdButton, WdSearch: { template: '<input>' }, WdLoading: true, WdEmpty: { props: ['tip'], template: '<div>{{ tip }}<slot name="bottom" /></div>' }, WdImg: true, WdIcon: true, WdTag, ScrollView: { template: '<div><slot /></div>' } } } })
}

describe('accommodation list page', () => {
  it('loads accommodations and opens an independent detail URL', async () => {
    getAccommodations.mockResolvedValueOnce([{ id: 701, name: '邛海湖畔酒店', summary: '临湖而居', address: '西昌市', reference_price: 398, category: { id: 71, name: '酒店' }, cover: null }])
    const wrapper = mountPage()
    await vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.()
    await flushPromises()
    expect(wrapper.text()).toContain('邛海湖畔酒店')
    expect(wrapper.text()).toContain('酒店')
    expect(wrapper.text()).toContain('参考价 ¥398 起')
    expect(wrapper.text()).toContain('全部')
    expect(wrapper.text()).not.toContain('安心住下')
    await wrapper.get('.item').trigger('click')
    expect(uni.navigateTo).toHaveBeenCalledWith({ url: '/pages/accommodations/detail?id=701' })
  })

  it('filters loaded accommodations locally and restores all results', async () => {
    getAccommodations.mockResolvedValueOnce([
      { id: 701, name: '邛海湖畔酒店', summary: '临湖而居', address: '西昌市', reference_price: 398, category: { id: 71, name: '酒店' }, cover: null },
      { id: 702, name: '月城精品民宿', summary: '庭院旅居', address: '建昌古城', reference_price: 258, category: { id: 72, name: '民宿' }, cover: null },
    ])
    const wrapper = mountPage()
    await vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.()
    await flushPromises()

    const tags = wrapper.findAll('.filter-tag')
    expect(tags.map(tag => tag.text())).toEqual(['全部', '酒店', '民宿'])
    await tags[2].trigger('click')
    expect(wrapper.text()).not.toContain('邛海湖畔酒店')
    expect(wrapper.text()).toContain('月城精品民宿')
    expect(getAccommodations).toHaveBeenCalledTimes(1)

    await wrapper.findAll('.filter-tag')[0].trigger('click')
    expect(wrapper.text()).toContain('邛海湖畔酒店')
  })

  it('shows retryable error and empty states', async () => {
    getAccommodations.mockRejectedValueOnce(new Error('network')).mockResolvedValueOnce([])
    const wrapper = mountPage()
    await vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.()
    await flushPromises()
    expect(wrapper.text()).toContain('住宿信息暂时无法加载')
    await wrapper.get('button').trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('暂无符合条件的住宿')
  })
})
