/* eslint-disable */
// @ts-ignore
import request from '@/http/openapi-request';
import type { OpenApiRequestOptions } from '@/http/types';

import * as API from './types';

/** 此处后端没有提供注释 GET /api/public/restaurants */
export function publicRestaurantsUsingGet({
  params,
  options,
}: {
  // 叠加生成的Param类型 (非body参数openapi默认没有生成对象)
  params: API.PublicRestaurantsUsingGetParams;
  options?: OpenApiRequestOptions;
}) {
  return request<API.PublicRestaurantsUsingGetResponse>(
    '/api/public/restaurants',
    {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

/** 此处后端没有提供注释 GET /api/public/restaurants/${param0} */
export function publicRestaurantsRestaurantUsingGet({
  params,
  options,
}: {
  // 叠加生成的Param类型 (非body参数openapi默认没有生成对象)
  params: API.PublicRestaurantsRestaurantUsingGetParams;
  options?: OpenApiRequestOptions;
}) {
  const { restaurant: param0, ...queryParams } = params;

  return request<API.PublicRestaurantsRestaurantUsingGetResponse>(
    `/api/public/restaurants/${param0}`,
    {
      method: 'GET',
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}
