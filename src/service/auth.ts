/* eslint-disable */
// @ts-ignore
import request from '@/http/openapi-request';
import type { OpenApiRequestOptions } from '@/http/types';

import * as API from './types';

/** 此处后端没有提供注释 POST /api/auth/login */
export function authLoginUsingPost({
  body,
  options,
}: {
  body: API.LoginRequest;
  options?: OpenApiRequestOptions;
}) {
  return request<API.AuthLoginUsingPostResponse>('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/auth/logout */
export function authLogoutUsingPost({
  options,
}: {
  options?: OpenApiRequestOptions;
}) {
  return request<API.AuthLogoutUsingPostResponse>('/api/auth/logout', {
    method: 'POST',
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/auth/me */
export function authMeUsingGet({
  options,
}: {
  options?: OpenApiRequestOptions;
}) {
  return request<API.AuthMeUsingGetResponse>('/api/auth/me', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 PUT /api/auth/password */
export function authPasswordUsingPut({
  body,
  options,
}: {
  body: API.ChangePasswordRequest;
  options?: OpenApiRequestOptions;
}) {
  return request<API.AuthPasswordUsingPutResponse>('/api/auth/password', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/auth/refresh */
export function authRefreshUsingPost({
  options,
}: {
  options?: OpenApiRequestOptions;
}) {
  return request<API.AuthRefreshUsingPostResponse>('/api/auth/refresh', {
    method: 'POST',
    ...(options || {}),
  });
}
