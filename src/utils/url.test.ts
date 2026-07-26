import { describe, expect, it } from 'vitest'
import { parseUrlToObj } from './url'

describe('parseUrlToObj', () => {
  it('preserves malformed encoded values instead of throwing', () => {
    expect(parseUrlToObj('/pages/me/me?redirect=%E0%A4%A')).toEqual({
      path: '/pages/me/me',
      query: { redirect: '%E0%A4%A' },
    })
  })

  it('decodes query values once and preserves equals signs', () => {
    expect(parseUrlToObj('/pages/auth/login?redirect=%252Fpages%252Fme%252Fme&signature=a%3Db')).toEqual({
      path: '/pages/auth/login',
      query: { redirect: '%2Fpages%2Fme%2Fme', signature: 'a=b' },
    })
  })

  it('preserves literal question marks after the query boundary', () => {
    expect(parseUrlToObj('/pages/search/index?term=what?why')).toEqual({
      path: '/pages/search/index',
      query: { term: 'what?why' },
    })
  })
})
