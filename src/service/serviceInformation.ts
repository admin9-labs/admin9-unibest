/* eslint-disable */
// @ts-ignore
import request from '@/http/openapi-request';
import type { OpenApiRequestOptions } from '@/http/types';

import * as API from './types';

/** 此处后端没有提供注释 GET /api/public/service-information */
export function publicServiceInformationUsingGet({
  params,
  options,
}: {
  // 叠加生成的Param类型 (非body参数openapi默认没有生成对象)
  params: API.PublicServiceInformationUsingGetParams;
  options?: OpenApiRequestOptions;
}) {
  return request<API.PublicServiceInformationUsingGetResponse>(
    '/api/public/service-information',
    {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

/** 此处后端没有提供注释 GET /api/public/service-information/${param0} */
export function publicServiceInformationServiceInformationUsingGet({
  params,
  options,
}: {
  // 叠加生成的Param类型 (非body参数openapi默认没有生成对象)
  params: API.PublicServiceInformationServiceInformationUsingGetParams;
  options?: OpenApiRequestOptions;
}) {
  const { serviceInformation: param0, ...queryParams } = params;

  return request<API.PublicServiceInformationServiceInformationUsingGetResponse>(
    `/api/public/service-information/${param0}`,
    {
      method: 'GET',
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}
