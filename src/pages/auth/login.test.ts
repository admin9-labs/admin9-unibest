import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import Login from './login.vue'

const { login } = vi.hoisted(() => ({ login: vi.fn() }))
vi.mock('@/store/token', () => ({ useTokenStore: () => ({ login }) }))

const WdInput = defineComponent({
  name: 'WdInput',
  props: ['modelValue'],
  emits: ['update:modelValue'],
  template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)">',
})
const WdButton = defineComponent({
  name: 'WdButton',
  props: ['loading'],
  emits: ['click'],
  template: '<button :data-loading="String(loading)" @click="$emit(\'click\')"><slot /></button>',
})

describe('login page', () => {
  it('normalizes the real encoded redirect before returning to the Me tab', async () => {
    login.mockResolvedValueOnce(undefined)
    const wrapper = mount(Login, {
      global: {
        stubs: {
          WdForm: { template: '<form><slot /></form>' },
          WdFormItem: { template: '<label><slot /></label>' },
          WdInput,
          WdButton,
        },
      },
    })

    const load = vi.mocked(onLoad).mock.calls[0]?.[0] as (query?: Record<string, string>) => void
    load({ redirect: '%252Fpages%252Fme%252Fme' })
    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('member@example.test')
    await inputs[1].setValue('password123')
    await wrapper.get('button').trigger('click')
    await flushPromises()

    expect(login).toHaveBeenCalledWith({ account: 'member@example.test', password: 'password123' })
    expect(uni.reLaunch).toHaveBeenCalledWith({ url: '/pages/me/me' })
    expect(uni.switchTab).not.toHaveBeenCalled()
  })

  it('catches a rejected login and restores the loading state', async () => {
    login.mockRejectedValueOnce(new Error('expected request failure'))
    const wrapper = mount(Login, {
      global: {
        stubs: {
          WdForm: { template: '<form><slot /></form>' },
          WdFormItem: { template: '<label><slot /></label>' },
          WdInput,
          WdButton,
        },
      },
    })

    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('member@example.test')
    await inputs[1].setValue('password123')
    await wrapper.get('button').trigger('click')
    await flushPromises()

    expect(login).toHaveBeenCalledWith({ account: 'member@example.test', password: 'password123' })
    expect(wrapper.get('button').attributes('data-loading')).toBe('false')
    expect(uni.showToast).not.toHaveBeenCalled()
  })
})
