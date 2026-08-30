import { describe, expect, it } from 'vitest'
import type { MapPoint } from '@/api/map-points'
import { clusterMapPoints } from './map-clustering'

function points(count: number): MapPoint[] {
  return Array.from({ length: count }, (_, index) => ({
    type: 'attraction',
    id: index + 1,
    key: `attraction:${index + 1}`,
    typeName: '景区',
    name: `西昌点位${index + 1}`,
    address: null,
    latitude: 27.8944,
    longitude: 102.2646,
    coordinate_system: 'GCJ-02',
    map_eligible: true,
    map_ineligible_reason: null,
    detail_url: `/pages/attractions/detail?id=${index + 1}`,
    detailUrl: `/pages/attractions/detail?id=${index + 1}`,
    distance_meters: null,
    distance_mode: null,
    is_directly_related: false,
    route_node_id: null,
    route_node_name: null,
    route_node_type: null,
    route_node_position: null,
  }))
}

describe('map point clustering', () => {
  it('keeps 100 points individually selectable', () => {
    expect(clusterMapPoints(points(100), 12)).toHaveLength(100)
  })

  it('clusters a complete 101 to 200 point viewport without discarding members', () => {
    for (const count of [101, 200]) {
      const groups = clusterMapPoints(points(count), 12)
      expect(groups).toHaveLength(1)
      expect(groups[0]).toMatchObject({ count, pointKey: null })
    }
  })
})
