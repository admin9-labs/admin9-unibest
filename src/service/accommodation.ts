/* eslint-disable */
// @ts-ignore
import request from '@/http/openapi-request';
import type { OpenApiRequestOptions } from '@/http/types';

import * as API from './types';

/** 此处后端没有提供注释 GET /api/public/accommodations */
export function publicAccommodationsUsingGet({
  params,
  options,
}: {
  // 叠加生成的Param类型 (非body参数openapi默认没有生成对象)
  params: API.PublicAccommodationsUsingGetParams;
  options?: OpenApiRequestOptions;
}) {
  return request<API.PublicAccommodationsUsingGetResponse>(
    '/api/public/accommodations',
    {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

/** 此处后端没有提供注释 GET /api/public/accommodations/${param0} */
export function publicAccommodationsAccommodationUsingGet({
  params,
  options,
}: {
  // 叠加生成的Param类型 (非body参数openapi默认没有生成对象)
  params: API.PublicAccommodationsAccommodationUsingGetParams;
  options?: OpenApiRequestOptions;
}) {
  const { accommodation: param0, ...queryParams } = params;

  return request<API.PublicAccommodationsAccommodationUsingGetResponse>(
    `/api/public/accommodations/${param0}`,
    {
      method: 'GET',
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}
