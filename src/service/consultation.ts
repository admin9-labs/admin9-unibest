/* eslint-disable */
// @ts-ignore
import request from '@/http/openapi-request';
import type { OpenApiRequestOptions } from '@/http/types';

import * as API from './types';

/** 此处后端没有提供注释 GET /api/consultations */
export function consultationsUsingGet({
  options,
}: {
  options?: OpenApiRequestOptions;
}) {
  return request<API.ConsultationsUsingGetResponse>('/api/consultations', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/consultations */
export function consultationsUsingPost({
  body,
  options,
}: {
  body: API.StoreConsultationRequest;
  options?: OpenApiRequestOptions;
}) {
  return request<API.ConsultationsUsingPostResponse>('/api/consultations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/consultations/${param0} */
export function consultationsConsultationUsingGet({
  params,
  options,
}: {
  // 叠加生成的Param类型 (非body参数openapi默认没有生成对象)
  params: API.ConsultationsConsultationUsingGetParams;
  options?: OpenApiRequestOptions;
}) {
  const { consultation: param0, ...queryParams } = params;

  return request<API.ConsultationsConsultationUsingGetResponse>(
    `/api/consultations/${param0}`,
    {
      method: 'GET',
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}

/** 此处后端没有提供注释 GET /api/public/consultation-categories */
export function publicConsultationCategoriesUsingGet({
  options,
}: {
  options?: OpenApiRequestOptions;
}) {
  return request<API.PublicConsultationCategoriesUsingGetResponse>(
    '/api/public/consultation-categories',
    {
      method: 'GET',
      ...(options || {}),
    }
  );
}

/** 此处后端没有提供注释 POST /api/public/consultations */
export function publicConsultationsUsingPost({
  body,
  options,
}: {
  body: API.StoreConsultationRequest;
  options?: OpenApiRequestOptions;
}) {
  return request<API.PublicConsultationsUsingPostResponse>(
    '/api/public/consultations',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: body,
      ...(options || {}),
    }
  );
}

/** 此处后端没有提供注释 POST /api/public/consultations/query */
export function publicConsultationsQueryUsingPost({
  body,
  options,
}: {
  body: API.QueryConsultationRequest;
  options?: OpenApiRequestOptions;
}) {
  return request<API.PublicConsultationsQueryUsingPostResponse>(
    '/api/public/consultations/query',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: body,
      ...(options || {}),
    }
  );
}
