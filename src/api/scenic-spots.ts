import type { TourismDestinationResource } from '@/service/types'
import { publicScenicSpotsScenicSpotUsingGet, publicScenicSpotsUsingGet } from '@/service/scenicSpot'

export type ScenicSpot = TourismDestinationResource

export async function getScenicSpots(keyword = '') {
  const response = await publicScenicSpotsUsingGet({
    params: { keyword: keyword || undefined, page_size: 50 },
    options: { auth: 'public', hideErrorToast: true },
  })
  return response.data as ScenicSpot[]
}

export async function getScenicSpot(id: number) {
  const response = await publicScenicSpotsScenicSpotUsingGet({
    params: { scenicSpot: id },
    options: { auth: 'public', hideErrorToast: true },
  })
  return response.data.scenic_spot as ScenicSpot
}
