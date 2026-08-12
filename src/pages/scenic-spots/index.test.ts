import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import ScenicSpotList from './index.vue'

const { getScenicSpots } = vi.hoisted(() => ({ getScenicSpots: vi.fn() }))
vi.mock('@/api/scenic-spots', () => ({ getScenicSpots }))

const WdButton = defineComponent({ emits: ['click'], template: '<button @click="$emit(\'click\')"><slot /></button>' })

function mountPage() {
  return mount(ScenicSpotList, {
    global: {
      stubs: {
        WdButton,
        WdSearch: { template: '<input>' },
        WdLoading: { template: '<div>正在加载景点</div>' },
        WdEmpty: { props: ['tip'], template: '<div>{{ tip }}<slot name="bottom" /></div>' },
        WdImg: true,
        WdIcon: true,
      },
    },
  })
}

describe('scenic spot list page', () => {
  it('loads published scenic spots and opens an independent detail URL', async () => {
    getScenicSpots.mockResolvedValueOnce([{ code: 'qionghai-lushan', name: '邛海泸山景区', summary: '山水相依', address: '西昌市', cover: null }])
    const wrapper = mountPage()
    const load = vi.mocked(onLoad).mock.calls.at(-1)?.[0]
    await load?.()
    await flushPromises()

    expect(wrapper.text()).toContain('邛海泸山景区')
    await wrapper.get('.spot').trigger('click')
    expect(uni.navigateTo).toHaveBeenCalledWith({ url: '/pages/scenic-spots/detail?code=qionghai-lushan' })
  })

  it('shows empty and retryable error states', async () => {
    getScenicSpots.mockRejectedValueOnce(new Error('network')).mockResolvedValueOnce([])
    const wrapper = mountPage()
    const load = vi.mocked(onLoad).mock.calls.at(-1)?.[0]
    await load?.()
    await flushPromises()
    expect(wrapper.text()).toContain('景点信息暂时无法加载')

    await wrapper.get('button').trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('暂无符合条件的景点')
  })
})
