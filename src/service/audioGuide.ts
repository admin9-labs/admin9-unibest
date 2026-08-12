/* eslint-disable */
// @ts-ignore
import request from '@/http/openapi-request';
import type { OpenApiRequestOptions } from '@/http/types';

import * as API from './types';

/** 此处后端没有提供注释 GET /api/public/audio-guides */
export function publicAudioGuidesUsingGet({
  params,
  options,
}: {
  // 叠加生成的Param类型 (非body参数openapi默认没有生成对象)
  params: API.PublicAudioGuidesUsingGetParams;
  options?: OpenApiRequestOptions;
}) {
  return request<API.PublicAudioGuidesUsingGetResponse>(
    '/api/public/audio-guides',
    {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

/** 此处后端没有提供注释 GET /api/public/audio-guides/${param0} */
export function publicAudioGuidesAudioGuideUsingGet({
  params,
  options,
}: {
  // 叠加生成的Param类型 (非body参数openapi默认没有生成对象)
  params: API.PublicAudioGuidesAudioGuideUsingGetParams;
  options?: OpenApiRequestOptions;
}) {
  const { audioGuide: param0, ...queryParams } = params;

  return request<API.PublicAudioGuidesAudioGuideUsingGetResponse>(
    `/api/public/audio-guides/${param0}`,
    {
      method: 'GET',
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}
