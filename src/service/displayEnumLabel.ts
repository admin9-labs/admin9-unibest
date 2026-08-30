/* eslint-disable */
// @ts-ignore
import * as API from './types';

export function displayCoordinateSystemEnum(field: API.Coordinate_systemEnum) {
  return { 'GCJ-02': 'GCJ-02' }[field];
}

export function displayNodeTypeEnum(field: API.Node_typeEnum) {
  return { attraction: 'attraction', scenic_spot: 'scenic_spot' }[field];
}

export function displayRatingEnum(field: API.RatingEnum) {
  return { helpful: 'helpful', unhelpful: 'unhelpful' }[field];
}

export function displayRatingEnum2(field: API.RatingEnum2) {
  return { helpful: 'helpful', unhelpful: 'unhelpful' }[field];
}

export function displayRelationTypeEnum(field: API.Relation_typeEnum) {
  return {
    attraction: 'attraction',
    scenic_spot: 'scenic_spot',
    travel_route: 'travel_route',
    restaurant: 'restaurant',
    accommodation: 'accommodation',
  }[field];
}

export function displayStatusEnum(field: API.StatusEnum) {
  return {
    pending: 'pending',
    processing: 'processing',
    resolved: 'resolved',
    closed: 'closed',
  }[field];
}

export function displayStatusEnum2(field: API.StatusEnum2) {
  return {
    pending: 'pending',
    processing: 'processing',
    replied: 'replied',
    closed: 'closed',
  }[field];
}

export function displayTargetTypeEnum(field: API.Target_typeEnum) {
  return {
    attraction: 'attraction',
    scenic_spot: 'scenic_spot',
    travel_route: 'travel_route',
  }[field];
}

export function displayTypeEnum(field: API.TypeEnum) {
  return {
    attraction: 'attraction',
    scenic_spot: 'scenic_spot',
    restaurant: 'restaurant',
    accommodation: 'accommodation',
    service_information: 'service_information',
    parking_facility: 'parking_facility',
  }[field];
}

export function displayTypeEnum2(field: API.TypeEnum2) {
  return { parking_lot: 'parking_lot', parking_point: 'parking_point' }[field];
}
