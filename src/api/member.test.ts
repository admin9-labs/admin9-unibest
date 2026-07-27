import type { MemberResource } from '@/service/types'
import { describe, expectTypeOf, it } from 'vitest'

describe('generated member contract', () => {
  it('preserves OpenAPI 3.1 nullable member fields', () => {
    expectTypeOf<MemberResource['name']>().toEqualTypeOf<string | null>()
    expectTypeOf<MemberResource['email']>().toEqualTypeOf<string | null>()
    expectTypeOf<MemberResource['mobile']>().toEqualTypeOf<string | null>()
    expectTypeOf<MemberResource['last_login_at']>().toEqualTypeOf<string | null>()
  })
})
