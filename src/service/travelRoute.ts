/* eslint-disable */
// @ts-ignore
import request from '@/http/openapi-request';
import type { OpenApiRequestOptions } from '@/http/types';

import * as API from './types';

/** 此处后端没有提供注释 GET /api/public/travel-routes */
export function publicTravelRoutesUsingGet({
  params,
  options,
}: {
  // 叠加生成的Param类型 (非body参数openapi默认没有生成对象)
  params: API.PublicTravelRoutesUsingGetParams;
  options?: OpenApiRequestOptions;
}) {
  return request<API.PublicTravelRoutesUsingGetResponse>(
    '/api/public/travel-routes',
    {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

/** 此处后端没有提供注释 GET /api/public/travel-routes/${param0} */
export function publicTravelRoutesTravelRouteUsingGet({
  params,
  options,
}: {
  // 叠加生成的Param类型 (非body参数openapi默认没有生成对象)
  params: API.PublicTravelRoutesTravelRouteUsingGetParams;
  options?: OpenApiRequestOptions;
}) {
  const { travelRoute: param0, ...queryParams } = params;

  return request<API.PublicTravelRoutesTravelRouteUsingGetResponse>(
    `/api/public/travel-routes/${param0}`,
    {
      method: 'GET',
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}
