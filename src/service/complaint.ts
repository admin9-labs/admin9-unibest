/* eslint-disable */
// @ts-ignore
import request from '@/http/openapi-request';
import type { OpenApiRequestOptions } from '@/http/types';

import * as API from './types';

/** 此处后端没有提供注释 GET /api/complaints */
export function complaintsUsingGet({
  options,
}: {
  options?: OpenApiRequestOptions;
}) {
  return request<API.ComplaintsUsingGetResponse>('/api/complaints', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/complaints */
export function complaintsUsingPost({
  body,
  options,
}: {
  body: API.StoreComplaintRequest;
  options?: OpenApiRequestOptions;
}) {
  return request<API.ComplaintsUsingPostResponse>('/api/complaints', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/complaints/${param0} */
export function complaintsComplaintUsingGet({
  params,
  options,
}: {
  // 叠加生成的Param类型 (非body参数openapi默认没有生成对象)
  params: API.ComplaintsComplaintUsingGetParams;
  options?: OpenApiRequestOptions;
}) {
  const { complaint: param0, ...queryParams } = params;

  return request<API.ComplaintsComplaintUsingGetResponse>(
    `/api/complaints/${param0}`,
    {
      method: 'GET',
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}

/** 此处后端没有提供注释 GET /api/public/complaint-categories */
export function publicComplaintCategoriesUsingGet({
  options,
}: {
  options?: OpenApiRequestOptions;
}) {
  return request<API.PublicComplaintCategoriesUsingGetResponse>(
    '/api/public/complaint-categories',
    {
      method: 'GET',
      ...(options || {}),
    }
  );
}

/** 此处后端没有提供注释 POST /api/public/complaint-evidence */
export function publicComplaintEvidenceUsingPost({
  body,
  options,
}: {
  body: API.StoreComplaintEvidenceRequest;
  options?: OpenApiRequestOptions;
}) {
  const formData = new FormData();

  Object.keys(body).forEach((ele) => {
    const item = (body as { [key: string]: any })[ele];

    if (item !== undefined && item !== null) {
      if (typeof item === 'object' && !(item instanceof globalThis.File)) {
        if (item instanceof Array) {
          item.forEach((f) => formData.append(ele, f || ''));
        } else {
          formData.append(ele, JSON.stringify(item));
        }
      } else {
        formData.append(ele, item);
      }
    }
  });

  return request<API.PublicComplaintEvidenceUsingPostResponse>(
    '/api/public/complaint-evidence',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      data: formData,
      ...(options || {}),
    }
  );
}

/** 此处后端没有提供注释 POST /api/public/complaints */
export function publicComplaintsUsingPost({
  body,
  options,
}: {
  body: API.StoreComplaintRequest;
  options?: OpenApiRequestOptions;
}) {
  return request<API.PublicComplaintsUsingPostResponse>(
    '/api/public/complaints',
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

/** 此处后端没有提供注释 POST /api/public/complaints/query */
export function publicComplaintsQueryUsingPost({
  body,
  options,
}: {
  body: API.QueryComplaintRequest;
  options?: OpenApiRequestOptions;
}) {
  return request<API.PublicComplaintsQueryUsingPostResponse>(
    '/api/public/complaints/query',
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
