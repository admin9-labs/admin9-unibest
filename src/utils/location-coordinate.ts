export type LocationCoordinateSystem = 'WGS84' | 'GCJ-02'

export interface LocationCoordinate {
  latitude: number
  longitude: number
}

const pi = Math.PI
const semiMajorAxis = 6378245
const eccentricitySquared = 0.006693421622965943

export function isValidLocationCoordinate(latitude: number, longitude: number): boolean {
  return Number.isFinite(latitude) && Number.isFinite(longitude)
    && latitude >= -90 && latitude <= 90
    && longitude >= -180 && longitude <= 180
}

export function isUserMapRegionChange(type?: string, causedBy?: string): boolean {
  return type === 'end' && (causedBy === 'drag' || causedBy === 'scale')
}

function isOutsideChina(latitude: number, longitude: number): boolean {
  return longitude < 72.004 || longitude > 137.8347 || latitude < 0.8293 || latitude > 55.8271
}

function transformLatitude(longitudeOffset: number, latitudeOffset: number): number {
  let value = -100 + 2 * longitudeOffset + 3 * latitudeOffset + 0.2 * latitudeOffset ** 2
    + 0.1 * longitudeOffset * latitudeOffset + 0.2 * Math.sqrt(Math.abs(longitudeOffset))
  value += (20 * Math.sin(6 * longitudeOffset * pi) + 20 * Math.sin(2 * longitudeOffset * pi)) * 2 / 3
  value += (20 * Math.sin(latitudeOffset * pi) + 40 * Math.sin(latitudeOffset / 3 * pi)) * 2 / 3
  value += (160 * Math.sin(latitudeOffset / 12 * pi) + 320 * Math.sin(latitudeOffset * pi / 30)) * 2 / 3
  return value
}

function transformLongitude(longitudeOffset: number, latitudeOffset: number): number {
  let value = 300 + longitudeOffset + 2 * latitudeOffset + 0.1 * longitudeOffset ** 2
    + 0.1 * longitudeOffset * latitudeOffset + 0.1 * Math.sqrt(Math.abs(longitudeOffset))
  value += (20 * Math.sin(6 * longitudeOffset * pi) + 20 * Math.sin(2 * longitudeOffset * pi)) * 2 / 3
  value += (20 * Math.sin(longitudeOffset * pi) + 40 * Math.sin(longitudeOffset / 3 * pi)) * 2 / 3
  value += (150 * Math.sin(longitudeOffset / 12 * pi) + 300 * Math.sin(longitudeOffset / 30 * pi)) * 2 / 3
  return value
}

export function normalizeLocationCoordinate(
  latitude: number,
  longitude: number,
  sourceSystem: LocationCoordinateSystem,
): LocationCoordinate {
  if (!isValidLocationCoordinate(latitude, longitude))
    throw new Error('Invalid location coordinate')
  if (sourceSystem === 'GCJ-02' || isOutsideChina(latitude, longitude))
    return { latitude, longitude }

  let latitudeDelta = transformLatitude(longitude - 105, latitude - 35)
  let longitudeDelta = transformLongitude(longitude - 105, latitude - 35)
  const latitudeRadians = latitude / 180 * pi
  let magic = Math.sin(latitudeRadians)
  magic = 1 - eccentricitySquared * magic ** 2
  const squareRootMagic = Math.sqrt(magic)
  latitudeDelta = latitudeDelta * 180 / ((semiMajorAxis * (1 - eccentricitySquared)) / (magic * squareRootMagic) * pi)
  longitudeDelta = longitudeDelta * 180 / (semiMajorAxis / squareRootMagic * Math.cos(latitudeRadians) * pi)

  return {
    latitude: latitude + latitudeDelta,
    longitude: longitude + longitudeDelta,
  }
}
