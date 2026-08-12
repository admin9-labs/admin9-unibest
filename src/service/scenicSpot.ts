/* eslint-disable */
// @ts-ignore
import request from '@/http/openapi-request';
import type { OpenApiRequestOptions } from '@/http/types';

import * as API from './types';

/** 此处后端没有提供注释 GET /api/public/scenic-spots */
export function publicScenicSpotsUsingGet({
  params,
  options,
}: {
  // 叠加生成的Param类型 (非body参数openapi默认没有生成对象)
  params: API.PublicScenicSpotsUsingGetParams;
  options?: OpenApiRequestOptions;
}) {
  return request<API.PublicScenicSpotsUsingGetResponse>(
    '/api/public/scenic-spots',
    {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

/** 此处后端没有提供注释 GET /api/public/scenic-spots/${param0} */
export function publicScenicSpotsScenicSpotUsingGet({
  params,
  options,
}: {
  // 叠加生成的Param类型 (非body参数openapi默认没有生成对象)
  params: API.PublicScenicSpotsScenicSpotUsingGetParams;
  options?: OpenApiRequestOptions;
}) {
  const { scenicSpot: param0, ...queryParams } = params;

  return request<API.PublicScenicSpotsScenicSpotUsingGetResponse>(
    `/api/public/scenic-spots/${param0}`,
    {
      method: 'GET',
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}
