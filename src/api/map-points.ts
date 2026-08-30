import type { MapPointResource, PublicMapPointsUsingGetParams, PublicMapPointsUsingGetResponse } from '@/service/types'
import { publicMapPointsUsingGet } from '@/service/mapPoint'

export type MapPointType = MapPointResource['type']
export type MapAnchorType = NonNullable<PublicMapPointsUsingGetParams['anchor_type']>
export interface MapPoint {
  type: MapPointType
  id: number
  name: string
  address: string | null
  latitude: number
  longitude: number
  coordinate_system: 'GCJ-02'
  map_eligible: true
  map_ineligible_reason: unknown
  detail_url: string
  distance_meters: number | null
  distance_mode: 'straight_line' | null
  is_directly_related: boolean
  route_node_id: number | null
  route_node_name: string | null
  route_node_type: 'attraction' | 'scenic_spot' | null
  route_node_position: number | null
  key: string
  typeName: string
  detailUrl: string
}

export interface MapPointResult {
  points: MapPoint[]
  meta: PublicMapPointsUsingGetResponse['meta']
}

const typeNames: Record<MapPointType, string> = {
  attraction: '景区',
  scenic_spot: '景点',
  restaurant: '餐饮',
  accommodation: '住宿',
  service_information: '公共服务',
  parking_facility: '停车设施',
}

export async function getMapPoints(params: PublicMapPointsUsingGetParams): Promise<MapPointResult> {
  const response = await publicMapPointsUsingGet({
    params,
    options: { auth: 'public', hideErrorToast: true },
  })

  return {
    points: response.data.map((point): MapPoint => ({
      type: point.type,
      id: point.id,
      name: point.name,
      address: point.address,
      latitude: point.latitude,
      longitude: point.longitude,
      coordinate_system: 'GCJ-02',
      map_eligible: true,
      map_ineligible_reason: null,
      detail_url: point.detail_url,
      distance_meters: point.distance_meters,
      distance_mode: point.distance_mode,
      is_directly_related: point.is_directly_related,
      route_node_id: point.route_node_id,
      route_node_name: point.route_node_name,
      route_node_type: point.route_node_type,
      route_node_position: point.route_node_position,
      key: `${point.type}:${point.id}`,
      typeName: typeNames[point.type],
      detailUrl: point.detail_url,
    })),
    meta: response.meta,
  }
}

export async function getNearbyMapPoints(anchorType: MapAnchorType, anchorId: number, radius?: number) {
  const params: PublicMapPointsUsingGetParams = {
    mode: 'nearby',
    anchor_type: anchorType,
    anchor_id: anchorId,
    radius,
    limit: 100,
  }
  const first = await getMapPoints(params)
  if (!first.meta.has_more || !first.meta.next_cursor)
    return first

  const second = await getMapPoints({ ...params, cursor: first.meta.next_cursor })
  return {
    points: [...first.points, ...second.points],
    meta: second.meta,
  }
}

export type MarkerDisplayMode = 'raw' | 'cluster' | 'too_many'

export function markerDisplayMode(pointCount: number, hasMore: boolean): MarkerDisplayMode {
  if (hasMore)
    return 'too_many'
  return pointCount > 100 ? 'cluster' : 'raw'
}

export function createLatestMapRequestGate() {
  let generation = 0
  return {
    begin() {
      generation += 1
      return generation
    },
    isCurrent(value: number) {
      return generation === value
    },
    invalidate() {
      generation += 1
    },
  }
}
