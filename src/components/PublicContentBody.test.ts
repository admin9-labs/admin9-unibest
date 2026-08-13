import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import PublicContentBody from './PublicContentBody.vue'

function mountBody(content: null | string) {
  return mount(PublicContentBody, {
    props: { content, title: '内容介绍' },
    global: {
      stubs: {
        RichText: {
          props: ['nodes'],
          template: '<div class="rich-text-stub" @error="$emit(\'error\')">{{ nodes }}</div>',
        },
      },
    },
  })
}

describe('public content body', () => {
  it('renders sanitized rich HTML with the native rich-text component', () => {
    const content = '<h2>游览提示</h2><p><strong>清晨</strong>前往</p><ul><li>携带饮水</li></ul><blockquote>注意防晒</blockquote><a href="https://example.com/very-long-address">查看说明</a>'
    const wrapper = mountBody(content)

    expect(wrapper.get('.rich-text-stub').text()).toBe(content)
    expect(wrapper.text()).toContain('内容介绍')
    expect(wrapper.find('.public-content-body__plain').exists()).toBe(false)
  })

  it('keeps historical plain-text line breaks out of rich-text', () => {
    const wrapper = mountBody('第一段\n第二段')

    expect(wrapper.get('.public-content-body__plain').text()).toBe('第一段\n第二段')
    expect(wrapper.find('.rich-text-stub').exists()).toBe(false)
  })

  it('hides empty content but keeps image-only rich content', async () => {
    const empty = mountBody(' <p><br></p> ')
    expect(empty.find('.public-content-body').exists()).toBe(false)
    expect(empty.text()).not.toContain('内容介绍')

    const image = mountBody('<p><img src="https://example.com/view.jpg" alt="邛海"></p>')
    expect(image.find('.rich-text-stub').exists()).toBe(true)
    await image.get('.rich-text-stub').trigger('error')
    expect(image.find('.public-content-body').exists()).toBe(true)
  })
})
