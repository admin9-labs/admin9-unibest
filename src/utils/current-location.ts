import type { LocationCoordinate } from './location-coordinate'

export const currentLocationCoordinateSystem = 'WGS84' as const

export function requestCurrentLocation(
  success: (coordinate: LocationCoordinate) => void,
  fail: () => void,
) {
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => success({ latitude: coords.latitude, longitude: coords.longitude }),
    fail,
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
  )
}
