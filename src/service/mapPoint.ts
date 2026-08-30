/* eslint-disable */
// @ts-ignore
import request from '@/http/openapi-request';
import type { OpenApiRequestOptions } from '@/http/types';

import * as API from './types';

/** Handle the incoming request GET /api/public/map-points */
export function publicMapPointsUsingGet({
  params,
  options,
}: {
  // 叠加生成的Param类型 (非body参数openapi默认没有生成对象)
  params: API.PublicMapPointsUsingGetParams;
  options?: OpenApiRequestOptions;
}) {
  return request<API.PublicMapPointsUsingGetResponse>(
    '/api/public/map-points',
    {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}
