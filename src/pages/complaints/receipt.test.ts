import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import Receipt from './receipt.vue'

vi.mock('@/utils/complaint-credential', () => ({ getComplaintCredential: () => 'a'.repeat(64) }))

describe('guest complaint receipt', () => {
  it('opens a ticket-only detail URL without exposing the credential', async () => {
    const wrapper = mount(Receipt, { global: { stubs: { WdIcon: true, WdEmpty: true, WdButton: { emits: ['click'], template: '<button @click="$emit(\'click\')"><slot /></button>' } } } })
    vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.({ ticket: 'TS-1' })
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('a'.repeat(64))
    await wrapper.findAll('button').at(-1)?.trigger('click')
    expect(uni.redirectTo).toHaveBeenCalledWith({ url: '/pages/complaints/detail?ticket=TS-1' })
  })
})
