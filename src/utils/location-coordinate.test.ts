import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { isUserMapRegionChange, isValidLocationCoordinate, normalizeLocationCoordinate } from './location-coordinate'

const mapPageSource = readFileSync(path.resolve(process.cwd(), 'src/pages/map/index.vue'), 'utf8')
const h5LocationSource = readFileSync(path.resolve(process.cwd(), 'src/utils/current-location.ts'), 'utf8')
const miniProgramLocationSource = readFileSync(path.resolve(process.cwd(), 'src/utils/current-location.mp-weixin.ts'), 'utf8')

describe('location coordinate handling', () => {
  it('converts mainland WGS84 coordinates to GCJ-02 without changing native GCJ-02 input', () => {
    const converted = normalizeLocationCoordinate(39.908823, 116.39747, 'WGS84')
    expect(converted.latitude).toBeCloseTo(39.910226, 5)
    expect(converted.longitude).toBeCloseTo(116.403714, 5)
    expect(normalizeLocationCoordinate(27.894, 102.272508, 'GCJ-02')).toEqual({ latitude: 27.894, longitude: 102.272508 })
  })

  it('keeps coordinates outside China unchanged and rejects invalid values', () => {
    expect(normalizeLocationCoordinate(48.8566, 2.3522, 'WGS84')).toEqual({ latitude: 48.8566, longitude: 2.3522 })
    expect(isValidLocationCoordinate(Number.NaN, 102.2)).toBe(false)
    expect(() => normalizeLocationCoordinate(91, 102.2, 'WGS84')).toThrow('Invalid location coordinate')
  })

  it('treats only completed drag and scale events as Mini Program viewport browsing', () => {
    expect(isUserMapRegionChange('end', 'drag')).toBe(true)
    expect(isUserMapRegionChange('end', 'scale')).toBe(true)
    expect(isUserMapRegionChange('end', 'update')).toBe(false)
    expect(isUserMapRegionChange('begin', 'drag')).toBe(false)
  })

  it('uses native browser WGS84 and WeChat GCJ-02 without persisting or logging coordinates', () => {
    expect(mapPageSource).toMatch(/from '@\/utils\/current-location'/)
    expect(h5LocationSource).toMatch(/currentLocationCoordinateSystem = 'WGS84'[\s\S]*navigator\.geolocation\.getCurrentPosition/)
    expect(miniProgramLocationSource).toMatch(/currentLocationCoordinateSystem = 'GCJ-02'[\s\S]*uni\.getLocation\(\{[\s\S]*type: 'gcj02'/)
    expect(mapPageSource).not.toMatch(/console\.|setStorage|localStorage/)
    expect(h5LocationSource).not.toMatch(/console\.|setStorage|localStorage/)
    expect(miniProgramLocationSource).not.toMatch(/console\.|setStorage|localStorage/)
  })
})
