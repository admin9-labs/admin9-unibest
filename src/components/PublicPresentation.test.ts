import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { describe, expect, it } from 'vitest'
import PublicContentCard from './PublicContentCard.vue'
import PublicDetailCover from './PublicDetailCover.vue'
import PublicDetailHeading from './PublicDetailHeading.vue'

const WdImg = defineComponent({
  props: ['src'],
  template: '<div class="wd-img-stub"><slot name="loading" /><slot name="error" /></div>',
})

describe('public presentation components', () => {
  it('keeps horizontal content cards stable with image states and business slots', async () => {
    const wrapper = mount(PublicContentCard, {
      props: { imageUrl: 'https://example.com/view.jpg', title: '邛海泸山景区', summary: '可换行的真实摘要' },
      slots: {
        badge: '<span>国家级景区</span>',
        meta: '<span>海滨中路</span>',
      },
      global: { stubs: { WdImg, WdIcon: true, WdLoading: true } },
    })

    expect(wrapper.classes()).toContain('public-content-card--horizontal')
    expect(wrapper.text()).toContain('邛海泸山景区')
    expect(wrapper.text()).toContain('国家级景区')
    expect(wrapper.text()).toContain('海滨中路')
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('supports a vertical card and a stable local placeholder without an image', () => {
    const wrapper = mount(PublicContentCard, {
      props: { layout: 'vertical', title: '环邛海线路' },
      global: { stubs: { WdImg, WdIcon: true, WdLoading: true } },
    })

    expect(wrapper.classes()).toContain('public-content-card--vertical')
    expect(wrapper.text()).toContain('暂无图片')
  })

  it('keeps detail cover failures and long headings inside stable presentation components', () => {
    const cover = mount(PublicDetailCover, {
      props: { src: 'https://example.com/detail.jpg' },
      global: { stubs: { WdImg, WdIcon: true, WdLoading: true } },
    })
    const heading = mount(PublicDetailHeading, {
      props: { title: '一个用于验证真实长标题能够自然换行的西昌文旅内容名称', summary: '真实摘要' },
      slots: { badge: '<span>景区</span>' },
    })

    expect(cover.text()).toContain('暂无图片')
    expect(heading.text()).toContain('一个用于验证真实长标题能够自然换行的西昌文旅内容名称')
    expect(heading.text()).toContain('景区')
  })
})
