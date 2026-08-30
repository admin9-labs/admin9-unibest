import { describe, expect, it, vi } from 'vitest'
import { createLatestMapRequestGate, getMapPoints, getNearbyMapPoints, markerDisplayMode } from './map-points'

const request = vi.hoisted(() => vi.fn())
vi.mock('@/service/mapPoint', () => ({ publicMapPointsUsingGet: request }))

describe('map point API adapter', () => {
  it('uses the unified contract and maps stable client display fields', async () => {
    request.mockResolvedValue({
      data: [{
        type: 'parking_facility',
        id: 701,
        name: '建昌古城外围停车场',
        address: '府街',
        latitude: 27.8944,
        longitude: 102.2646,
        coordinate_system: 'GCJ-02',
        map_eligible: true,
        map_ineligible_reason: null,
        detail_url: '/pages/parking-facilities/detail?id=701',
        distance_meters: null,
        distance_mode: null,
        is_directly_related: false,
        route_node_id: null,
        route_node_name: null,
        route_node_type: null,
        route_node_position: null,
      }],
      meta: { pagination: 'cursor', next_cursor: null, page_size: 200, has_more: false, mode: 'bbox', coordinate_system: 'GCJ-02', distance_mode: null },
    })

    const result = await getMapPoints({ mode: 'bbox', south: 27.7, west: 102.1, north: 28, east: 102.4, limit: 200 })

    expect(request).toHaveBeenCalledWith(expect.objectContaining({ params: expect.objectContaining({ mode: 'bbox', limit: 200 }) }))
    expect(result.points[0]).toMatchObject({ key: 'parking_facility:701', typeName: '停车设施', detailUrl: '/pages/parking-facilities/detail?id=701' })
  })

  it.each([
    [99, false, 'raw'],
    [100, false, 'raw'],
    [101, false, 'cluster'],
    [200, false, 'cluster'],
    [200, true, 'too_many'],
  ] as const)('classifies %i returned points with has_more=%s', (count, hasMore, expected) => {
    expect(markerDisplayMode(count, hasMore)).toBe(expected)
  })

  it('aggregates a second nearby cursor page before classifying the result', async () => {
    const makePoint = (id: number) => ({
      type: 'attraction',
      id,
      name: `点位 ${id}`,
      address: null,
      latitude: 27.8,
      longitude: 102.2,
      coordinate_system: 'GCJ-02',
      map_eligible: true,
      map_ineligible_reason: null,
      detail_url: `/pages/attractions/detail?id=${id}`,
      distance_meters: id,
      distance_mode: 'straight_line',
      is_directly_related: false,
      route_node_id: null,
      route_node_name: null,
      route_node_type: null,
      route_node_position: null,
    })
    request
      .mockResolvedValueOnce({
        data: Array.from({ length: 100 }, (_, index) => makePoint(index + 1)),
        meta: { pagination: 'cursor', next_cursor: 'page-2', page_size: 100, has_more: true, mode: 'nearby', coordinate_system: 'GCJ-02', distance_mode: 'straight_line' },
      })
      .mockResolvedValueOnce({
        data: [makePoint(101)],
        meta: { pagination: 'cursor', next_cursor: null, page_size: 100, has_more: false, mode: 'nearby', coordinate_system: 'GCJ-02', distance_mode: 'straight_line' },
      })

    const result = await getNearbyMapPoints('attraction', 9)

    expect(request).toHaveBeenCalledTimes(2)
    expect(request).toHaveBeenLastCalledWith(expect.objectContaining({ params: expect.objectContaining({ cursor: 'page-2', limit: 100 }) }))
    expect(result.points).toHaveLength(101)
    expect(markerDisplayMode(result.points.length, result.meta.has_more)).toBe('cluster')
  })

  it('accepts only the latest map response after fast viewport changes', () => {
    const gate = createLatestMapRequestGate()
    const first = gate.begin()
    const second = gate.begin()
    expect(gate.isCurrent(first)).toBe(false)
    expect(gate.isCurrent(second)).toBe(true)
    gate.invalidate()
    expect(gate.isCurrent(second)).toBe(false)
  })
})
