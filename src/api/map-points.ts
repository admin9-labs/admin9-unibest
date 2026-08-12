import { getAccommodations } from '@/api/accommodations'
import { getAttractions } from '@/api/attractions'
import { getRestaurants } from '@/api/restaurants'
import { getScenicSpots } from '@/api/scenic-spots'

export type MapPointType = 'attraction' | 'scenic-spot' | 'restaurant' | 'accommodation'

export interface MapPoint {
  id: string
  code: string
  type: MapPointType
  typeName: string
  name: string
  address: string | null
  latitude: number
  longitude: number
  detailUrl: string
}

interface LocatedContent {
  code: string
  name: string
  address?: string | null
  latitude?: number | null
  longitude?: number | null
}

const pointTypes: Array<{
  type: MapPointType
  typeName: string
  detailPath: string
  load: () => Promise<LocatedContent[]>
}> = [
  { type: 'attraction', typeName: '景区', detailPath: 'attractions', load: getAttractions },
  { type: 'scenic-spot', typeName: '景点', detailPath: 'scenic-spots', load: getScenicSpots },
  { type: 'restaurant', typeName: '餐饮', detailPath: 'restaurants', load: getRestaurants },
  { type: 'accommodation', typeName: '住宿', detailPath: 'accommodations', load: getAccommodations },
]

function hasValidCoordinates(item: LocatedContent): item is LocatedContent & { latitude: number, longitude: number } {
  return typeof item.latitude === 'number'
    && Number.isFinite(item.latitude)
    && item.latitude >= -90
    && item.latitude <= 90
    && typeof item.longitude === 'number'
    && Number.isFinite(item.longitude)
    && item.longitude >= -180
    && item.longitude <= 180
}

export async function getMapPoints(): Promise<MapPoint[]> {
  const results = await Promise.allSettled(pointTypes.map(item => item.load()))
  const succeeded = results.filter(result => result.status === 'fulfilled')

  if (succeeded.length === 0)
    throw new Error('All map point sources failed')

  return results.flatMap((result, index) => {
    if (result.status === 'rejected')
      return []

    const definition = pointTypes[index]
    return result.value.filter(hasValidCoordinates).map(item => ({
      id: `${definition.type}:${item.code}`,
      code: item.code,
      type: definition.type,
      typeName: definition.typeName,
      name: item.name,
      address: item.address ?? null,
      latitude: item.latitude,
      longitude: item.longitude,
      detailUrl: `/pages/${definition.detailPath}/detail?code=${encodeURIComponent(item.code)}`,
    }))
  })
}
