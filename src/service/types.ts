/* eslint-disable */
// @ts-ignore

export type AuthLoginUsingPostResponse = {
  /** Whether the request was successful */
  success: boolean;
  /** Business status code, 0 = success */
  code: number;
  message: string;
  data: {
    access_token: string;
    token_type: string;
    expires_in: number;
    member: MemberResource;
  };
  /** UUID7 for request tracing */
  request_id: string;
};

export type AuthLoginUsingPostResponses = {
  200: AuthLoginUsingPostResponse;
  /**
   * Unauthorized
   */
  401: AuthLoginUsingPostResponse;
  /**
   * Content Too Large
   */
  413: AuthLoginUsingPostResponse;
  /**
   * Unprocessable Content
   */
  422: AuthLoginUsingPostResponse;
  /**
   * Too Many Requests
   */
  429: AuthLoginUsingPostResponse;
  /**
   * Internal Server Error
   */
  500: AuthLoginUsingPostResponse;
};

export type AuthLogoutUsingPostResponse = {
  /** Whether the request was successful */
  success: boolean;
  /** Business status code, 0 = success */
  code: number;
  message: string;
  data: Record<string, unknown>;
  /** UUID7 for request tracing */
  request_id: string;
};

export type AuthLogoutUsingPostResponses = {
  200: AuthLogoutUsingPostResponse;
  /**
   * Unauthorized
   */
  401: AuthLogoutUsingPostResponse;
  /**
   * Forbidden
   */
  403: AuthLogoutUsingPostResponse;
  /**
   * Content Too Large
   */
  413: AuthLogoutUsingPostResponse;
  /**
   * Too Many Requests
   */
  429: AuthLogoutUsingPostResponse;
  /**
   * Internal Server Error
   */
  500: AuthLogoutUsingPostResponse;
};

export type AuthMeUsingGetResponse = {
  /** Whether the request was successful */
  success: boolean;
  /** Business status code, 0 = success */
  code: number;
  message: string;
  data: {
    member: MemberResource;
  };
  /** UUID7 for request tracing */
  request_id: string;
};

export type AuthMeUsingGetResponses = {
  200: AuthMeUsingGetResponse;
  /**
   * Unauthorized
   */
  401: AuthMeUsingGetResponse;
  /**
   * Forbidden
   */
  403: AuthMeUsingGetResponse;
  /**
   * Too Many Requests
   */
  429: AuthMeUsingGetResponse;
  /**
   * Internal Server Error
   */
  500: AuthMeUsingGetResponse;
};

export type AuthPasswordUsingPutResponse = {
  /** Whether the request was successful */
  success: boolean;
  /** Business status code, 0 = success */
  code: number;
  message: string;
  data: Record<string, unknown>;
  /** UUID7 for request tracing */
  request_id: string;
};

export type AuthPasswordUsingPutResponses = {
  200: AuthPasswordUsingPutResponse;
  /**
   * Unauthorized
   */
  401: AuthPasswordUsingPutResponse;
  /**
   * Forbidden
   */
  403: AuthPasswordUsingPutResponse;
  /**
   * Content Too Large
   */
  413: AuthPasswordUsingPutResponse;
  /**
   * Unprocessable Content
   */
  422: AuthPasswordUsingPutResponse;
  /**
   * Too Many Requests
   */
  429: AuthPasswordUsingPutResponse;
  /**
   * Internal Server Error
   */
  500: AuthPasswordUsingPutResponse;
};

export type AuthRefreshUsingPostResponse = {
  /** Whether the request was successful */
  success: boolean;
  /** Business status code, 0 = success */
  code: number;
  message: string;
  data: {
    access_token: string;
    token_type: string;
    expires_in: number;
    member: MemberResource;
  };
  /** UUID7 for request tracing */
  request_id: string;
};

export type AuthRefreshUsingPostResponses = {
  200: AuthRefreshUsingPostResponse;
  /**
   * Unauthorized
   */
  401: AuthRefreshUsingPostResponse;
  /**
   * Forbidden
   */
  403: AuthRefreshUsingPostResponse;
  /**
   * Content Too Large
   */
  413: AuthRefreshUsingPostResponse;
  /**
   * Too Many Requests
   */
  429: AuthRefreshUsingPostResponse;
  /**
   * Internal Server Error
   */
  500: AuthRefreshUsingPostResponse;
};

export type ChangePasswordRequest = {
  current_password: string;
  password: string;
  password_confirmation: string;
};

export type LoginRequest = {
  account: string;
  password: string;
};

export type MemberResource = {
  id: number;
  name: unknown;
  email: unknown;
  mobile: unknown;
  is_active: boolean;
  last_login_at: unknown;
};
