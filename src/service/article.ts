/* eslint-disable */
// @ts-ignore
import request from '@/http/openapi-request';
import type { OpenApiRequestOptions } from '@/http/types';

import * as API from './types';

/** 此处后端没有提供注释 GET /api/public/articles */
export function publicArticlesUsingGet({
  params,
  options,
}: {
  // 叠加生成的Param类型 (非body参数openapi默认没有生成对象)
  params: API.PublicArticlesUsingGetParams;
  options?: OpenApiRequestOptions;
}) {
  return request<API.PublicArticlesUsingGetResponse>('/api/public/articles', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/public/articles/${param0} */
export function publicArticlesArticleUsingGet({
  params,
  options,
}: {
  // 叠加生成的Param类型 (非body参数openapi默认没有生成对象)
  params: API.PublicArticlesArticleUsingGetParams;
  options?: OpenApiRequestOptions;
}) {
  const { article: param0, ...queryParams } = params;

  return request<API.PublicArticlesArticleUsingGetResponse>(
    `/api/public/articles/${param0}`,
    {
      method: 'GET',
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}
