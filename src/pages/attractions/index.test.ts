import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import AttractionList from './index.vue'

const { getAttractions } = vi.hoisted(() => ({ getAttractions: vi.fn() }))
vi.mock('@/api/attractions', () => ({ getAttractions }))

const WdButton = defineComponent({ emits: ['click'], template: '<button @click="$emit(\'click\')"><slot /></button>' })
const WdSearch = defineComponent({
  props: { modelValue: { type: String, default: '' } },
  emits: ['update:modelValue', 'search'],
  template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" @keyup.enter="$emit(\'search\')">',
})

function mountPage() {
  return mount(AttractionList, {
    global: { stubs: { WdButton, WdSearch, WdLoading: true, WdEmpty: { props: ['tip'], template: '<div>{{ tip }}<slot name="bottom" /></div>' }, WdImg: true, WdIcon: true } },
  })
}

describe('attraction list page', () => {
  it('loads attractions and opens an independent detail URL', async () => {
    getAttractions.mockResolvedValueOnce([{ id: 101, name: '邛海泸山景区', summary: '山水相依', address: '西昌市', cover: null }])
    const wrapper = mountPage()
    await vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.()
    await flushPromises()

    expect(wrapper.text()).toContain('邛海泸山景区')
    expect(wrapper.text()).toContain('暂无图片')
    expect(wrapper.text()).not.toContain('循着山水')
    expect(wrapper.get('.item').classes()).toContain('destination-item')
    await wrapper.get('.item').trigger('click')
    expect(uni.navigateTo).toHaveBeenCalledWith({ url: '/pages/attractions/detail?id=101' })
  })

  it('shows empty and retryable error states', async () => {
    getAttractions.mockRejectedValueOnce(new Error('network')).mockResolvedValueOnce([])
    const wrapper = mountPage()
    await vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.()
    await flushPromises()
    expect(wrapper.text()).toContain('景区信息暂时无法加载')
    await wrapper.get('button').trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('暂时没有可浏览的景区')
  })

  it('reloads with a trimmed search keyword', async () => {
    getAttractions.mockResolvedValueOnce([]).mockResolvedValueOnce([{ id: 101, name: '邛海泸山景区', summary: '山水相依', address: '西昌市', cover: null }])
    const wrapper = mountPage()
    await vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.()
    await flushPromises()

    const search = wrapper.get('input')
    await search.setValue('  邛海  ')
    await search.trigger('keyup', { key: 'Enter' })
    await flushPromises()

    expect(getAttractions).toHaveBeenLastCalledWith('邛海')
    expect(wrapper.text()).toContain('邛海泸山景区')
  })

  it('distinguishes a filtered empty result and clears the search', async () => {
    getAttractions.mockResolvedValue([])
    const wrapper = mountPage()
    await vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.()
    await flushPromises()

    const search = wrapper.get('input')
    await search.setValue('  不存在的地点  ')
    await search.trigger('keyup', { key: 'Enter' })
    await flushPromises()
    expect(wrapper.text()).toContain('未找到匹配的景区')

    await wrapper.get('button').trigger('click')
    await flushPromises()
    expect(getAttractions).toHaveBeenLastCalledWith('')
  })
})
