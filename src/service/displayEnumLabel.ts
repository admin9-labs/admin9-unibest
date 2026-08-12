/* eslint-disable */
// @ts-ignore
import * as API from './types';

export function displayNodeTypeEnum(field: API.Node_typeEnum) {
  return { attraction: 'attraction', scenic_spot: 'scenic_spot' }[field];
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
