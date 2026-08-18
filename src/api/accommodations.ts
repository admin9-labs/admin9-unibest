import type { LodgingPlaceResource } from '@/service/types'
import { publicAccommodationsAccommodationUsingGet, publicAccommodationsUsingGet } from '@/service/accommodation'

export type Accommodation = LodgingPlaceResource

export async function getAccommodations(keyword = '') {
  const response = await publicAccommodationsUsingGet({ params: { keyword: keyword || undefined, page_size: 50 }, options: { auth: 'public', hideErrorToast: true } })
  return response.data as Accommodation[]
}

export async function getAccommodation(id: number) {
  const response = await publicAccommodationsAccommodationUsingGet({ params: { accommodation: id }, options: { auth: 'public', hideErrorToast: true } })
  return response.data.accommodation as Accommodation
}
