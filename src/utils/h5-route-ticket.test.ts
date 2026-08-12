import { describe, expect, it } from 'vitest'
import { currentH5Ticket } from './h5-route-ticket'

describe('h5 consultation route ticket', () => {
  it('reads only the ticket parameter from the current hash', () => {
    window.location.hash = '#/pages/consultations/detail?ticket=ZX-1&other=value'
    expect(currentH5Ticket()).toBe('ZX-1')
  })
})
