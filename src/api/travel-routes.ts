import type { TourismRouteResource } from '@/service/types'
import { publicTravelRoutesTravelRouteUsingGet, publicTravelRoutesUsingGet } from '@/service/travelRoute'

export type TravelRoute = TourismRouteResource

export async function getTravelRoutes(keyword = '') {
  const response = await publicTravelRoutesUsingGet({ params: { keyword: keyword || undefined, page_size: 50 }, options: { auth: 'public', hideErrorToast: true } })
  return response.data as TravelRoute[]
}

export async function getTravelRoute(code: string) {
  const response = await publicTravelRoutesTravelRouteUsingGet({ params: { travelRoute: code }, options: { auth: 'public', hideErrorToast: true } })
  return response.data.travel_route as TravelRoute
}
