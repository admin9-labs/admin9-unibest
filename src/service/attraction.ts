/* eslint-disable */
// @ts-ignore
import request from '@/http/openapi-request';
import type { OpenApiRequestOptions } from '@/http/types';

import * as API from './types';

/** 此处后端没有提供注释 GET /api/public/attractions */
export function publicAttractionsUsingGet({
  params,
  options,
}: {
  // 叠加生成的Param类型 (非body参数openapi默认没有生成对象)
  params: API.PublicAttractionsUsingGetParams;
  options?: OpenApiRequestOptions;
}) {
  return request<API.PublicAttractionsUsingGetResponse>(
    '/api/public/attractions',
    {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

/** 此处后端没有提供注释 GET /api/public/attractions/${param0} */
export function publicAttractionsAttractionUsingGet({
  params,
  options,
}: {
  // 叠加生成的Param类型 (非body参数openapi默认没有生成对象)
  params: API.PublicAttractionsAttractionUsingGetParams;
  options?: OpenApiRequestOptions;
}) {
  const { attraction: param0, ...queryParams } = params;

  return request<API.PublicAttractionsAttractionUsingGetResponse>(
    `/api/public/attractions/${param0}`,
    {
      method: 'GET',
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}
