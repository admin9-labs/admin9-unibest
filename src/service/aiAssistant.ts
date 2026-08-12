/* eslint-disable */
// @ts-ignore
import request from '@/http/openapi-request';
import type { OpenApiRequestOptions } from '@/http/types';

import * as API from './types';

/** 此处后端没有提供注释 GET /api/public/ai-assistants */
export function publicAiAssistantsUsingGet({
  options,
}: {
  options?: OpenApiRequestOptions;
}) {
  return request<API.PublicAiAssistantsUsingGetResponse>(
    '/api/public/ai-assistants',
    {
      method: 'GET',
      ...(options || {}),
    }
  );
}

/** 此处后端没有提供注释 GET /api/public/ai-assistants/${param0} */
export function publicAiAssistantsAiAssistantUsingGet({
  params,
  options,
}: {
  // 叠加生成的Param类型 (非body参数openapi默认没有生成对象)
  params: API.PublicAiAssistantsAiAssistantUsingGetParams;
  options?: OpenApiRequestOptions;
}) {
  const { aiAssistant: param0, ...queryParams } = params;

  return request<API.PublicAiAssistantsAiAssistantUsingGetResponse>(
    `/api/public/ai-assistants/${param0}`,
    {
      method: 'GET',
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}

/** 此处后端没有提供注释 POST /api/public/ai-assistants/${param0}/chat */
export function publicAiAssistantsAiAssistantChatUsingPost({
  params,
  body,
  options,
}: {
  // 叠加生成的Param类型 (非body参数openapi默认没有生成对象)
  params: API.PublicAiAssistantsAiAssistantChatUsingPostParams;
  body: API.PublicAiChatRequest;
  options?: OpenApiRequestOptions;
}) {
  const { aiAssistant: param0, ...queryParams } = params;

  return request<API.PublicAiAssistantsAiAssistantChatUsingPostResponse>(
    `/api/public/ai-assistants/${param0}/chat`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      params: { ...queryParams },
      data: body,
      ...(options || {}),
    }
  );
}

/** 此处后端没有提供注释 POST /api/public/ai-feedback */
export function publicAiFeedbackUsingPost({
  body,
  options,
}: {
  body: API.SubmitPublicAiFeedbackRequest;
  options?: OpenApiRequestOptions;
}) {
  return request<API.PublicAiFeedbackUsingPostResponse>(
    '/api/public/ai-feedback',
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

/** 此处后端没有提供注释 GET /api/public/ai-feedback-categories */
export function publicAiFeedbackCategoriesUsingGet({
  options,
}: {
  options?: OpenApiRequestOptions;
}) {
  return request<API.PublicAiFeedbackCategoriesUsingGetResponse>(
    '/api/public/ai-feedback-categories',
    {
      method: 'GET',
      ...(options || {}),
    }
  );
}
