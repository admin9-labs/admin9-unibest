import { describe, expect, it } from 'vitest'
import { stringifyQuery } from './queryString'

describe('stringifyQuery', () => {
  it('uses Laravel bracket syntax for array query values', () => {
    expect(stringifyQuery({ status: ['active', 'pending review'] }))
      .toBe('status%5B%5D=active&status%5B%5D=pending%20review')
  })

  it('encodes scalar keys and values and skips nullish entries', () => {
    const query: Record<string, unknown> = {}
    query['search term'] = 'a&b'
    query.page = 2
    query.empty = null
    query.missing = undefined
    expect(stringifyQuery(query))
      .toBe('search%20term=a%26b&page=2')
  })

  it('omits empty arrays without producing stray separators', () => {
    expect(stringifyQuery({ empty: [], page: 2, another: [] })).toBe('page=2')
  })
})
