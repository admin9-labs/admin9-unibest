import type { LocationCoordinate } from './location-coordinate'

export const currentLocationCoordinateSystem = 'GCJ-02' as const

export function requestCurrentLocation(
  success: (coordinate: LocationCoordinate) => void,
  fail: () => void,
) {
  uni.getLocation({
    type: 'gcj02',
    isHighAccuracy: true,
    highAccuracyExpireTime: 10000,
    success: ({ latitude, longitude }) => success({ latitude, longitude }),
    fail,
  })
}
