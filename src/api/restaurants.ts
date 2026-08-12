import type { DiningPlaceResource } from '@/service/types'
import { publicRestaurantsRestaurantUsingGet, publicRestaurantsUsingGet } from '@/service/restaurant'

export type Restaurant = DiningPlaceResource

export async function getRestaurants(keyword = '', categoryCode = '') {
  const response = await publicRestaurantsUsingGet({
    params: {
      keyword: keyword || undefined,
      category_code: categoryCode || undefined,
      page_size: 50,
    },
    options: { auth: 'public', hideErrorToast: true },
  })
  return response.data as Restaurant[]
}

export async function getRestaurant(code: string) {
  const response = await publicRestaurantsRestaurantUsingGet({
    params: { restaurant: code },
    options: { auth: 'public', hideErrorToast: true },
  })
  return response.data.restaurant as Restaurant
}
