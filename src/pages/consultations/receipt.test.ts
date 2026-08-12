import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import Receipt from './receipt.vue'

vi.mock('@/utils/consultation-credential', () => ({ getConsultationCredential: () => 'a'.repeat(64) }))

describe('guest consultation receipt', () => {
  it('shows the one-time local credential and opens detail without putting it in the URL', async () => {
    const wrapper = mount(Receipt, { global: { stubs: { WdIcon: true, WdEmpty: true, WdButton: { emits: ['click'], template: '<button @click="$emit(\'click\')"><slot /></button>' } } } })
    vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.({ ticket: 'ZX-1' })
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('a'.repeat(64))
    await wrapper.findAll('button').at(-1)?.trigger('click')
    expect(uni.redirectTo).toHaveBeenCalledWith({ url: '/pages/consultations/detail?ticket=ZX-1' })
  })
})
