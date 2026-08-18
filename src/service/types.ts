/* eslint-disable */
// @ts-ignore

export type AiChatResource = {
  assistant: {
    id: number;
    name: string;
  };
  answer: string;
  message_reference: string;
  message_reference_expires_at: string;
  knowledge_used_count: number;
};

export type AiFeedbackCategoryResource = {
  id: number;
  name: string;
};

export type AiFeedbackReceiptResource = {
  accepted: boolean;
  rating: 'helpful' | 'unhelpful';
  category_id: number;
};

export type ArticleRelationLinkResource = {
  relation_type:
    | 'attraction'
    | 'scenic_spot'
    | 'travel_route'
    | 'restaurant'
    | 'accommodation';
  position: number;
  target: {
    id: number;
    name: string;
  };
};

export type AudioGuidePlaybackResource = {
  id: number;
  title: string;
  summary: string | null;
  script: string | null;
  audio: {
    url: string;
    mime_type: string;
    size: number;
  };
  target_type: 'attraction' | 'scenic_spot' | 'travel_route';
  target: {
    id: number;
    name: string;
  };
};

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

export type ComplaintCategoryResource = {
  id: number;
  name: string;
};

export type ComplaintEvidenceResource = {
  id: number;
  url: string;
  width: number | null;
  height: number | null;
};

export type ComplaintProgressResource = {
  ticket_no: string;
  category: {
    id: number;
    name: string;
  } | null;
  target_type: string | null;
  target_name: string;
  title: string;
  content: string;
  status: 'pending' | 'processing' | 'resolved' | 'closed';
  resolution_content: string | null;
  close_reason: string | null;
  accepted_at: string | null;
  resolved_at: string | null;
  closed_at: string | null;
  created_at: string | null;
  evidence: ComplaintEvidenceResource[];
  contact: {
    name: string;
    mobile: string | null;
    email: string | null;
  } | null;
};

export type ComplaintsComplaintUsingGetParams = {
  complaint: string;
};

export type ComplaintsComplaintUsingGetResponse = {
  /** Whether the request was successful */
  success: boolean;
  /** Business status code, 0 = success */
  code: number;
  message: string;
  data: {
    complaint: ComplaintProgressResource;
  };
  /** UUID7 for request tracing */
  request_id: string;
};

export type ComplaintsComplaintUsingGetResponses = {
  200: ComplaintsComplaintUsingGetResponse;
  /**
   * Unauthorized
   */
  401: ComplaintsComplaintUsingGetResponse;
  /**
   * Forbidden
   */
  403: ComplaintsComplaintUsingGetResponse;
  /**
   * Not Found
   */
  404: ComplaintsComplaintUsingGetResponse;
  /**
   * Too Many Requests
   */
  429: ComplaintsComplaintUsingGetResponse;
  /**
   * Internal Server Error
   */
  500: ComplaintsComplaintUsingGetResponse;
};

export type ComplaintsUsingGetResponse = {
  /** Whether the request was successful */
  success: boolean;
  /** Business status code, 0 = success */
  code: number;
  message: string;
  data: ComplaintProgressResource[];
  meta: {
    /** Pagination strategy */
    pagination: string;
    /** Current page number */
    page: number;
    /** Items per page */
    page_size: number;
    /** Whether more pages exist */
    has_more: boolean;
    /** Total number of items */
    total: number;
  };
  /** UUID7 for request tracing */
  request_id: string;
};

export type ComplaintsUsingGetResponses = {
  /**
   * Paginated list
   */
  200: ComplaintsUsingGetResponse;
  /**
   * Unauthorized
   */
  401: ComplaintsUsingGetResponse;
  /**
   * Forbidden
   */
  403: ComplaintsUsingGetResponse;
  /**
   * Too Many Requests
   */
  429: ComplaintsUsingGetResponse;
  /**
   * Internal Server Error
   */
  500: ComplaintsUsingGetResponse;
};

export type ComplaintsUsingPostResponse = {
  /** Whether the request was successful */
  success: boolean;
  /** Business status code, 0 = success */
  code: number;
  message: string;
  data: {
    complaint: ComplaintProgressResource;
  };
  /** UUID7 for request tracing */
  request_id: string;
};

export type ComplaintsUsingPostResponses = {
  200: ComplaintsUsingPostResponse;
  /**
   * Unauthorized
   */
  401: ComplaintsUsingPostResponse;
  /**
   * Forbidden
   */
  403: ComplaintsUsingPostResponse;
  /**
   * Content Too Large
   */
  413: ComplaintsUsingPostResponse;
  /**
   * Unprocessable Content
   */
  422: ComplaintsUsingPostResponse;
  /**
   * Too Many Requests
   */
  429: ComplaintsUsingPostResponse;
  /**
   * Internal Server Error
   */
  500: ComplaintsUsingPostResponse;
};

export type ConsultationCategoryResource = {
  id: number;
  name: string;
};

export type ConsultationProgressResource = {
  ticket_no: string;
  category: {
    id: number;
    name: string;
  } | null;
  subject: string;
  content: string;
  status: 'pending' | 'processing' | 'replied' | 'closed';
  reply_content: string | null;
  close_reason: string | null;
  accepted_at: string | null;
  replied_at: string | null;
  closed_at: string | null;
  created_at: string | null;
  contact: {
    name: string;
    mobile: string | null;
    email: string | null;
  } | null;
};

export type ConsultationsConsultationUsingGetParams = {
  consultation: string;
};

export type ConsultationsConsultationUsingGetResponse = {
  /** Whether the request was successful */
  success: boolean;
  /** Business status code, 0 = success */
  code: number;
  message: string;
  data: {
    consultation: ConsultationProgressResource;
  };
  /** UUID7 for request tracing */
  request_id: string;
};

export type ConsultationsConsultationUsingGetResponses = {
  200: ConsultationsConsultationUsingGetResponse;
  /**
   * Unauthorized
   */
  401: ConsultationsConsultationUsingGetResponse;
  /**
   * Forbidden
   */
  403: ConsultationsConsultationUsingGetResponse;
  /**
   * Not Found
   */
  404: ConsultationsConsultationUsingGetResponse;
  /**
   * Too Many Requests
   */
  429: ConsultationsConsultationUsingGetResponse;
  /**
   * Internal Server Error
   */
  500: ConsultationsConsultationUsingGetResponse;
};

export type ConsultationsUsingGetResponse = {
  /** Whether the request was successful */
  success: boolean;
  /** Business status code, 0 = success */
  code: number;
  message: string;
  data: ConsultationProgressResource[];
  meta: {
    /** Pagination strategy */
    pagination: string;
    /** Current page number */
    page: number;
    /** Items per page */
    page_size: number;
    /** Whether more pages exist */
    has_more: boolean;
    /** Total number of items */
    total: number;
  };
  /** UUID7 for request tracing */
  request_id: string;
};

export type ConsultationsUsingGetResponses = {
  /**
   * Paginated list
   */
  200: ConsultationsUsingGetResponse;
  /**
   * Unauthorized
   */
  401: ConsultationsUsingGetResponse;
  /**
   * Forbidden
   */
  403: ConsultationsUsingGetResponse;
  /**
   * Too Many Requests
   */
  429: ConsultationsUsingGetResponse;
  /**
   * Internal Server Error
   */
  500: ConsultationsUsingGetResponse;
};

export type ConsultationsUsingPostResponse = {
  /** Whether the request was successful */
  success: boolean;
  /** Business status code, 0 = success */
  code: number;
  message: string;
  data: {
    consultation: ConsultationProgressResource;
  };
  /** UUID7 for request tracing */
  request_id: string;
};

export type ConsultationsUsingPostResponses = {
  200: ConsultationsUsingPostResponse;
  /**
   * Unauthorized
   */
  401: ConsultationsUsingPostResponse;
  /**
   * Forbidden
   */
  403: ConsultationsUsingPostResponse;
  /**
   * Content Too Large
   */
  413: ConsultationsUsingPostResponse;
  /**
   * Unprocessable Content
   */
  422: ConsultationsUsingPostResponse;
  /**
   * Too Many Requests
   */
  429: ConsultationsUsingPostResponse;
  /**
   * Internal Server Error
   */
  500: ConsultationsUsingPostResponse;
};

export type DiningPlaceResource = {
  id: number;
  name: string;
  summary: string | null;
  description: string | null;
  category: {
    id: number;
    name: string;
  } | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  cover: {
    url: string;
    width: number | null;
    height: number | null;
  } | null;
  gallery?: {
    url: string;
    width: number | null;
    height: number | null;
  }[];
  phone: string | null;
  opening_hours: string | null;
  average_price: number | null;
  signature_dishes: string[] | null;
  attraction?: {
    id: number;
    name: string;
  } | null;
  scenic_spot?: {
    id: number;
    name: string;
  } | null;
};

export type LodgingPlaceResource = {
  id: number;
  name: string;
  summary: string | null;
  description: string | null;
  category: {
    id: number;
    name: string;
  } | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  cover: {
    url: string;
    width: number | null;
    height: number | null;
  } | null;
  gallery?: {
    url: string;
    width: number | null;
    height: number | null;
  }[];
  phone: string | null;
  check_in_time: string | null;
  check_out_time: string | null;
  reference_price: number | null;
  facilities: string[] | null;
  attraction?: {
    id: number;
    name: string;
  } | null;
  scenic_spot?: {
    id: number;
    name: string;
  } | null;
};

export type LoginRequest = {
  account: string;
  password: string;
};

export type MemberResource = {
  id: number;
  name: string | null;
  email: string | null;
  mobile: string | null;
  is_active: boolean;
  last_login_at: string | null;
};

export enum Node_typeEnum {
  'attraction' = 'attraction',
  'scenic_spot' = 'scenic_spot',
}

export type INode_typeEnum = keyof typeof Node_typeEnum;

export type PublicAccommodationsAccommodationUsingGetParams = {
  /** The accommodation ID */
  accommodation: number;
};

export type PublicAccommodationsAccommodationUsingGetResponse = {
  /** Whether the request was successful */
  success: boolean;
  /** Business status code, 0 = success */
  code: number;
  message: string;
  data: {
    accommodation: LodgingPlaceResource;
  };
  /** UUID7 for request tracing */
  request_id: string;
};

export type PublicAccommodationsAccommodationUsingGetResponses = {
  200: PublicAccommodationsAccommodationUsingGetResponse;
  /**
   * Not Found
   */
  404: PublicAccommodationsAccommodationUsingGetResponse;
  /**
   * Too Many Requests
   */
  429: PublicAccommodationsAccommodationUsingGetResponse;
  /**
   * Internal Server Error
   */
  500: PublicAccommodationsAccommodationUsingGetResponse;
};

export type PublicAccommodationsUsingGetParams = {
  page?: number;
  page_size?: number;
  keyword?: string | null;
  category_id?: number | null;
};

export type PublicAccommodationsUsingGetResponse = {
  /** Whether the request was successful */
  success: boolean;
  /** Business status code, 0 = success */
  code: number;
  message: string;
  data: LodgingPlaceResource[];
  meta: {
    /** Pagination strategy */
    pagination: string;
    /** Current page number */
    page: number;
    /** Items per page */
    page_size: number;
    /** Whether more pages exist */
    has_more: boolean;
    /** Total number of items */
    total: number;
  };
  /** UUID7 for request tracing */
  request_id: string;
};

export type PublicAccommodationsUsingGetResponses = {
  /**
   * Paginated list
   */
  200: PublicAccommodationsUsingGetResponse;
  /**
   * Unprocessable Content
   */
  422: PublicAccommodationsUsingGetResponse;
  /**
   * Too Many Requests
   */
  429: PublicAccommodationsUsingGetResponse;
  /**
   * Internal Server Error
   */
  500: PublicAccommodationsUsingGetResponse;
};

export type PublicAiAssistantResource = {
  id: number;
  name: string;
  description: string | null;
  welcome_message: string;
};

export type PublicAiAssistantsAiAssistantChatStreamUsingPostParams = {
  aiAssistant: string | number;
};

export type PublicAiAssistantsAiAssistantChatStreamUsingPostResponses = {
  /**
   * SSE text/event-stream. Events: start, delta, complete, error.
   */
  200: string;
  /**
   * Not Found
   */
  404: {
    success: false;
    code: number;
    message: string;
    data: Record<string, unknown>;
    errors: Record<string, unknown>;
    request_id: string;
  };
  /**
   * Content Too Large
   */
  413: {
    success: false;
    code: number;
    message: string;
    data: Record<string, unknown>;
    errors: Record<string, unknown>;
    request_id: string;
  };
  /**
   * Unprocessable Content
   */
  422: {
    success: false;
    code: number;
    message: string;
    data: Record<string, unknown>;
    errors: Record<string, string[]>;
    request_id: string;
  };
  /**
   * Too Many Requests
   */
  429: {
    success: false;
    code: number;
    message: string;
    data: Record<string, unknown>;
    errors: Record<string, unknown>;
    request_id: string;
  };
  /**
   * Internal Server Error
   */
  500: {
    success: false;
    code: number;
    message: string;
    data: Record<string, unknown>;
    errors: Record<string, unknown>;
    request_id: string;
  };
};

export type PublicAiAssistantsAiAssistantChatUsingPostParams = {
  aiAssistant: string | number;
};

export type PublicAiAssistantsAiAssistantChatUsingPostResponse = {
  /** Whether the request was successful */
  success: boolean;
  /** Business status code, 0 = success */
  code: number;
  message: string;
  data: {
    chat: AiChatResource;
  };
  /** UUID7 for request tracing */
  request_id: string;
};

export type PublicAiAssistantsAiAssistantChatUsingPostResponses = {
  200: PublicAiAssistantsAiAssistantChatUsingPostResponse;
  /**
   * Not Found
   */
  404: PublicAiAssistantsAiAssistantChatUsingPostResponse;
  /**
   * Content Too Large
   */
  413: PublicAiAssistantsAiAssistantChatUsingPostResponse;
  /**
   * Unprocessable Content
   */
  422: PublicAiAssistantsAiAssistantChatUsingPostResponse;
  /**
   * Too Many Requests
   */
  429: PublicAiAssistantsAiAssistantChatUsingPostResponse;
  /**
   * Internal Server Error
   */
  500: PublicAiAssistantsAiAssistantChatUsingPostResponse;
  /**
   * Bad Gateway
   */
  502: PublicAiAssistantsAiAssistantChatUsingPostResponse;
  /**
   * Service Unavailable
   */
  503: PublicAiAssistantsAiAssistantChatUsingPostResponse;
  /**
   * Gateway Timeout
   */
  504: PublicAiAssistantsAiAssistantChatUsingPostResponse;
};

export type PublicAiAssistantsAiAssistantUsingGetParams = {
  aiAssistant: string | number;
};

export type PublicAiAssistantsAiAssistantUsingGetResponse = {
  /** Whether the request was successful */
  success: boolean;
  /** Business status code, 0 = success */
  code: number;
  message: string;
  data: {
    ai_assistant: PublicAiAssistantResource;
  };
  /** UUID7 for request tracing */
  request_id: string;
};

export type PublicAiAssistantsAiAssistantUsingGetResponses = {
  200: PublicAiAssistantsAiAssistantUsingGetResponse;
  /**
   * Not Found
   */
  404: PublicAiAssistantsAiAssistantUsingGetResponse;
  /**
   * Too Many Requests
   */
  429: PublicAiAssistantsAiAssistantUsingGetResponse;
  /**
   * Internal Server Error
   */
  500: PublicAiAssistantsAiAssistantUsingGetResponse;
};

export type PublicAiAssistantsUsingGetResponse = {
  /** Whether the request was successful */
  success: boolean;
  /** Business status code, 0 = success */
  code: number;
  message: string;
  data: PublicAiAssistantResource[];
  /** UUID7 for request tracing */
  request_id: string;
};

export type PublicAiAssistantsUsingGetResponses = {
  /**
   * Array of `PublicAiAssistantResource`
   */
  200: PublicAiAssistantsUsingGetResponse;
  /**
   * Too Many Requests
   */
  429: PublicAiAssistantsUsingGetResponse;
  /**
   * Internal Server Error
   */
  500: PublicAiAssistantsUsingGetResponse;
};

export type PublicAiChatRequest = {
  message: string;
};

export type PublicAiFeedbackCategoriesUsingGetResponse = {
  /** Whether the request was successful */
  success: boolean;
  /** Business status code, 0 = success */
  code: number;
  message: string;
  data: AiFeedbackCategoryResource[];
  /** UUID7 for request tracing */
  request_id: string;
};

export type PublicAiFeedbackCategoriesUsingGetResponses = {
  /**
   * Array of `AiFeedbackCategoryResource`
   */
  200: PublicAiFeedbackCategoriesUsingGetResponse;
  /**
   * Too Many Requests
   */
  429: PublicAiFeedbackCategoriesUsingGetResponse;
  /**
   * Internal Server Error
   */
  500: PublicAiFeedbackCategoriesUsingGetResponse;
};

export type PublicAiFeedbackUsingPostResponse = {
  /** Whether the request was successful */
  success: boolean;
  /** Business status code, 0 = success */
  code: number;
  message: string;
  data: {
    feedback: AiFeedbackReceiptResource;
  };
  /** UUID7 for request tracing */
  request_id: string;
};

export type PublicAiFeedbackUsingPostResponses = {
  200: PublicAiFeedbackUsingPostResponse;
  /**
   * Not Found
   */
  404: PublicAiFeedbackUsingPostResponse;
  /**
   * Content Too Large
   */
  413: PublicAiFeedbackUsingPostResponse;
  /**
   * Unprocessable Content
   */
  422: PublicAiFeedbackUsingPostResponse;
  /**
   * Too Many Requests
   */
  429: PublicAiFeedbackUsingPostResponse;
  /**
   * Internal Server Error
   */
  500: PublicAiFeedbackUsingPostResponse;
};

export type PublicArticlesArticleUsingGetParams = {
  /** The article ID */
  article: number;
};

export type PublicArticlesArticleUsingGetResponse = {
  /** Whether the request was successful */
  success: boolean;
  /** Business status code, 0 = success */
  code: number;
  message: string;
  data: {
    article: PublishedContentResource;
  };
  /** UUID7 for request tracing */
  request_id: string;
};

export type PublicArticlesArticleUsingGetResponses = {
  200: PublicArticlesArticleUsingGetResponse;
  /**
   * Not Found
   */
  404: PublicArticlesArticleUsingGetResponse;
  /**
   * Too Many Requests
   */
  429: PublicArticlesArticleUsingGetResponse;
  /**
   * Internal Server Error
   */
  500: PublicArticlesArticleUsingGetResponse;
};

export type PublicArticlesUsingGetParams = {
  page?: number;
  page_size?: number;
  keyword?: string | null;
  category_id?: number | null;
  is_recommended?: boolean;
};

export type PublicArticlesUsingGetResponse = {
  /** Whether the request was successful */
  success: boolean;
  /** Business status code, 0 = success */
  code: number;
  message: string;
  data: PublishedContentResource[];
  meta: {
    /** Pagination strategy */
    pagination: string;
    /** Current page number */
    page: number;
    /** Items per page */
    page_size: number;
    /** Whether more pages exist */
    has_more: boolean;
    /** Total number of items */
    total: number;
  };
  /** UUID7 for request tracing */
  request_id: string;
};

export type PublicArticlesUsingGetResponses = {
  /**
   * Paginated list
   */
  200: PublicArticlesUsingGetResponse;
  /**
   * Unprocessable Content
   */
  422: PublicArticlesUsingGetResponse;
  /**
   * Too Many Requests
   */
  429: PublicArticlesUsingGetResponse;
  /**
   * Internal Server Error
   */
  500: PublicArticlesUsingGetResponse;
};

export type PublicAttractionsAttractionUsingGetParams = {
  /** The attraction ID */
  attraction: number;
};

export type PublicAttractionsAttractionUsingGetResponse = {
  /** Whether the request was successful */
  success: boolean;
  /** Business status code, 0 = success */
  code: number;
  message: string;
  data: {
    attraction: TourismAreaResource;
  };
  /** UUID7 for request tracing */
  request_id: string;
};

export type PublicAttractionsAttractionUsingGetResponses = {
  200: PublicAttractionsAttractionUsingGetResponse;
  /**
   * Not Found
   */
  404: PublicAttractionsAttractionUsingGetResponse;
  /**
   * Too Many Requests
   */
  429: PublicAttractionsAttractionUsingGetResponse;
  /**
   * Internal Server Error
   */
  500: PublicAttractionsAttractionUsingGetResponse;
};

export type PublicAttractionsUsingGetParams = {
  page?: number;
  page_size?: number;
  keyword?: string | null;
  is_recommended?: boolean;
};

export type PublicAttractionsUsingGetResponse = {
  /** Whether the request was successful */
  success: boolean;
  /** Business status code, 0 = success */
  code: number;
  message: string;
  data: TourismAreaResource[];
  meta: {
    /** Pagination strategy */
    pagination: string;
    /** Current page number */
    page: number;
    /** Items per page */
    page_size: number;
    /** Whether more pages exist */
    has_more: boolean;
    /** Total number of items */
    total: number;
  };
  /** UUID7 for request tracing */
  request_id: string;
};

export type PublicAttractionsUsingGetResponses = {
  /**
   * Paginated list
   */
  200: PublicAttractionsUsingGetResponse;
  /**
   * Unprocessable Content
   */
  422: PublicAttractionsUsingGetResponse;
  /**
   * Too Many Requests
   */
  429: PublicAttractionsUsingGetResponse;
  /**
   * Internal Server Error
   */
  500: PublicAttractionsUsingGetResponse;
};

export type PublicAudioGuidesAudioGuideUsingGetParams = {
  /** The audio guide ID */
  audioGuide: number;
};

export type PublicAudioGuidesAudioGuideUsingGetResponse = {
  /** Whether the request was successful */
  success: boolean;
  /** Business status code, 0 = success */
  code: number;
  message: string;
  data: {
    audio_guide: AudioGuidePlaybackResource;
  };
  /** UUID7 for request tracing */
  request_id: string;
};

export type PublicAudioGuidesAudioGuideUsingGetResponses = {
  200: PublicAudioGuidesAudioGuideUsingGetResponse;
  /**
   * Not Found
   */
  404: PublicAudioGuidesAudioGuideUsingGetResponse;
  /**
   * Too Many Requests
   */
  429: PublicAudioGuidesAudioGuideUsingGetResponse;
  /**
   * Internal Server Error
   */
  500: PublicAudioGuidesAudioGuideUsingGetResponse;
};

export type PublicAudioGuidesUsingGetParams = {
  page?: number;
  page_size?: number;
  keyword?: string | null;
  target_type?: 'attraction' | 'scenic_spot' | 'travel_route' | null;
  target_id?: number | null;
};

export type PublicAudioGuidesUsingGetResponse = {
  /** Whether the request was successful */
  success: boolean;
  /** Business status code, 0 = success */
  code: number;
  message: string;
  data: AudioGuidePlaybackResource[];
  meta: {
    /** Pagination strategy */
    pagination: string;
    /** Current page number */
    page: number;
    /** Items per page */
    page_size: number;
    /** Whether more pages exist */
    has_more: boolean;
    /** Total number of items */
    total: number;
  };
  /** UUID7 for request tracing */
  request_id: string;
};

export type PublicAudioGuidesUsingGetResponses = {
  /**
   * Paginated list
   */
  200: PublicAudioGuidesUsingGetResponse;
  /**
   * Unprocessable Content
   */
  422: PublicAudioGuidesUsingGetResponse;
  /**
   * Too Many Requests
   */
  429: PublicAudioGuidesUsingGetResponse;
  /**
   * Internal Server Error
   */
  500: PublicAudioGuidesUsingGetResponse;
};

export type PublicComplaintCategoriesUsingGetResponse = {
  /** Whether the request was successful */
  success: boolean;
  /** Business status code, 0 = success */
  code: number;
  message: string;
  data: ComplaintCategoryResource[];
  /** UUID7 for request tracing */
  request_id: string;
};

export type PublicComplaintCategoriesUsingGetResponses = {
  /**
   * Array of `ComplaintCategoryResource`
   */
  200: PublicComplaintCategoriesUsingGetResponse;
  /**
   * Too Many Requests
   */
  429: PublicComplaintCategoriesUsingGetResponse;
  /**
   * Internal Server Error
   */
  500: PublicComplaintCategoriesUsingGetResponse;
};

export type PublicComplaintEvidenceUsingPostResponse = {
  /** Whether the request was successful */
  success: boolean;
  /** Business status code, 0 = success */
  code: number;
  message: string;
  data: {
    evidence: ComplaintEvidenceResource;
    upload_token: string;
    upload_token_expires_at: string;
  };
  /** UUID7 for request tracing */
  request_id: string;
};

export type PublicComplaintEvidenceUsingPostResponses = {
  200: PublicComplaintEvidenceUsingPostResponse;
  /**
   * Content Too Large
   */
  413: PublicComplaintEvidenceUsingPostResponse;
  /**
   * Unprocessable Content
   */
  422: PublicComplaintEvidenceUsingPostResponse;
  /**
   * Too Many Requests
   */
  429: PublicComplaintEvidenceUsingPostResponse;
  /**
   * Internal Server Error
   */
  500: PublicComplaintEvidenceUsingPostResponse;
};

export type PublicComplaintsQueryUsingPostResponse = {
  /** Whether the request was successful */
  success: boolean;
  /** Business status code, 0 = success */
  code: number;
  message: string;
  data: {
    complaint: ComplaintProgressResource;
    query_credential_expires_at: string;
  };
  /** UUID7 for request tracing */
  request_id: string;
};

export type PublicComplaintsQueryUsingPostResponses = {
  200: PublicComplaintsQueryUsingPostResponse;
  /**
   * Not Found
   */
  404: PublicComplaintsQueryUsingPostResponse;
  /**
   * Content Too Large
   */
  413: PublicComplaintsQueryUsingPostResponse;
  /**
   * Unprocessable Content
   */
  422: PublicComplaintsQueryUsingPostResponse;
  /**
   * Too Many Requests
   */
  429: PublicComplaintsQueryUsingPostResponse;
  /**
   * Internal Server Error
   */
  500: PublicComplaintsQueryUsingPostResponse;
};

export type PublicComplaintsUsingPostResponse = {
  /** Whether the request was successful */
  success: boolean;
  /** Business status code, 0 = success */
  code: number;
  message: string;
  data: {
    complaint: ComplaintProgressResource;
    query_credential: string | null;
    query_credential_expires_at: string;
  };
  /** UUID7 for request tracing */
  request_id: string;
};

export type PublicComplaintsUsingPostResponses = {
  200: PublicComplaintsUsingPostResponse;
  /**
   * Not Found
   */
  404: PublicComplaintsUsingPostResponse;
  /**
   * Content Too Large
   */
  413: PublicComplaintsUsingPostResponse;
  /**
   * Unprocessable Content
   */
  422: PublicComplaintsUsingPostResponse;
  /**
   * Too Many Requests
   */
  429: PublicComplaintsUsingPostResponse;
  /**
   * Internal Server Error
   */
  500: PublicComplaintsUsingPostResponse;
};

export type PublicConsultationCategoriesUsingGetResponse = {
  /** Whether the request was successful */
  success: boolean;
  /** Business status code, 0 = success */
  code: number;
  message: string;
  data: ConsultationCategoryResource[];
  /** UUID7 for request tracing */
  request_id: string;
};

export type PublicConsultationCategoriesUsingGetResponses = {
  /**
   * Array of `ConsultationCategoryResource`
   */
  200: PublicConsultationCategoriesUsingGetResponse;
  /**
   * Too Many Requests
   */
  429: PublicConsultationCategoriesUsingGetResponse;
  /**
   * Internal Server Error
   */
  500: PublicConsultationCategoriesUsingGetResponse;
};

export type PublicConsultationsQueryUsingPostResponse = {
  /** Whether the request was successful */
  success: boolean;
  /** Business status code, 0 = success */
  code: number;
  message: string;
  data: {
    consultation: ConsultationProgressResource;
    query_credential_expires_at: string;
  };
  /** UUID7 for request tracing */
  request_id: string;
};

export type PublicConsultationsQueryUsingPostResponses = {
  200: PublicConsultationsQueryUsingPostResponse;
  /**
   * Not Found
   */
  404: PublicConsultationsQueryUsingPostResponse;
  /**
   * Content Too Large
   */
  413: PublicConsultationsQueryUsingPostResponse;
  /**
   * Unprocessable Content
   */
  422: PublicConsultationsQueryUsingPostResponse;
  /**
   * Too Many Requests
   */
  429: PublicConsultationsQueryUsingPostResponse;
  /**
   * Internal Server Error
   */
  500: PublicConsultationsQueryUsingPostResponse;
};

export type PublicConsultationsUsingPostResponse = {
  /** Whether the request was successful */
  success: boolean;
  /** Business status code, 0 = success */
  code: number;
  message: string;
  data: {
    consultation: ConsultationProgressResource;
    query_credential: string | null;
    query_credential_expires_at: string;
  };
  /** UUID7 for request tracing */
  request_id: string;
};

export type PublicConsultationsUsingPostResponses = {
  200: PublicConsultationsUsingPostResponse;
  /**
   * Content Too Large
   */
  413: PublicConsultationsUsingPostResponse;
  /**
   * Unprocessable Content
   */
  422: PublicConsultationsUsingPostResponse;
  /**
   * Too Many Requests
   */
  429: PublicConsultationsUsingPostResponse;
  /**
   * Internal Server Error
   */
  500: PublicConsultationsUsingPostResponse;
};

export type PublicRestaurantsRestaurantUsingGetParams = {
  /** The restaurant ID */
  restaurant: number;
};

export type PublicRestaurantsRestaurantUsingGetResponse = {
  /** Whether the request was successful */
  success: boolean;
  /** Business status code, 0 = success */
  code: number;
  message: string;
  data: {
    restaurant: DiningPlaceResource;
  };
  /** UUID7 for request tracing */
  request_id: string;
};

export type PublicRestaurantsRestaurantUsingGetResponses = {
  200: PublicRestaurantsRestaurantUsingGetResponse;
  /**
   * Not Found
   */
  404: PublicRestaurantsRestaurantUsingGetResponse;
  /**
   * Too Many Requests
   */
  429: PublicRestaurantsRestaurantUsingGetResponse;
  /**
   * Internal Server Error
   */
  500: PublicRestaurantsRestaurantUsingGetResponse;
};

export type PublicRestaurantsUsingGetParams = {
  page?: number;
  page_size?: number;
  keyword?: string | null;
  category_id?: number | null;
};

export type PublicRestaurantsUsingGetResponse = {
  /** Whether the request was successful */
  success: boolean;
  /** Business status code, 0 = success */
  code: number;
  message: string;
  data: DiningPlaceResource[];
  meta: {
    /** Pagination strategy */
    pagination: string;
    /** Current page number */
    page: number;
    /** Items per page */
    page_size: number;
    /** Whether more pages exist */
    has_more: boolean;
    /** Total number of items */
    total: number;
  };
  /** UUID7 for request tracing */
  request_id: string;
};

export type PublicRestaurantsUsingGetResponses = {
  /**
   * Paginated list
   */
  200: PublicRestaurantsUsingGetResponse;
  /**
   * Unprocessable Content
   */
  422: PublicRestaurantsUsingGetResponse;
  /**
   * Too Many Requests
   */
  429: PublicRestaurantsUsingGetResponse;
  /**
   * Internal Server Error
   */
  500: PublicRestaurantsUsingGetResponse;
};

export type PublicScenicSpotsScenicSpotUsingGetParams = {
  /** The scenic spot ID */
  scenicSpot: number;
};

export type PublicScenicSpotsScenicSpotUsingGetResponse = {
  /** Whether the request was successful */
  success: boolean;
  /** Business status code, 0 = success */
  code: number;
  message: string;
  data: {
    scenic_spot: TourismDestinationResource;
  };
  /** UUID7 for request tracing */
  request_id: string;
};

export type PublicScenicSpotsScenicSpotUsingGetResponses = {
  200: PublicScenicSpotsScenicSpotUsingGetResponse;
  /**
   * Not Found
   */
  404: PublicScenicSpotsScenicSpotUsingGetResponse;
  /**
   * Too Many Requests
   */
  429: PublicScenicSpotsScenicSpotUsingGetResponse;
  /**
   * Internal Server Error
   */
  500: PublicScenicSpotsScenicSpotUsingGetResponse;
};

export type PublicScenicSpotsUsingGetParams = {
  page?: number;
  page_size?: number;
  keyword?: string | null;
  is_recommended?: boolean;
};

export type PublicScenicSpotsUsingGetResponse = {
  /** Whether the request was successful */
  success: boolean;
  /** Business status code, 0 = success */
  code: number;
  message: string;
  data: TourismDestinationResource[];
  meta: {
    /** Pagination strategy */
    pagination: string;
    /** Current page number */
    page: number;
    /** Items per page */
    page_size: number;
    /** Whether more pages exist */
    has_more: boolean;
    /** Total number of items */
    total: number;
  };
  /** UUID7 for request tracing */
  request_id: string;
};

export type PublicScenicSpotsUsingGetResponses = {
  /**
   * Paginated list
   */
  200: PublicScenicSpotsUsingGetResponse;
  /**
   * Unprocessable Content
   */
  422: PublicScenicSpotsUsingGetResponse;
  /**
   * Too Many Requests
   */
  429: PublicScenicSpotsUsingGetResponse;
  /**
   * Internal Server Error
   */
  500: PublicScenicSpotsUsingGetResponse;
};

export type PublicServiceInformationServiceInformationUsingGetParams = {
  /** The service information ID */
  serviceInformation: number;
};

export type PublicServiceInformationServiceInformationUsingGetResponse = {
  /** Whether the request was successful */
  success: boolean;
  /** Business status code, 0 = success */
  code: number;
  message: string;
  data: {
    service_information: VisitorServiceResource;
  };
  /** UUID7 for request tracing */
  request_id: string;
};

export type PublicServiceInformationServiceInformationUsingGetResponses = {
  200: PublicServiceInformationServiceInformationUsingGetResponse;
  /**
   * Not Found
   */
  404: PublicServiceInformationServiceInformationUsingGetResponse;
  /**
   * Too Many Requests
   */
  429: PublicServiceInformationServiceInformationUsingGetResponse;
  /**
   * Internal Server Error
   */
  500: PublicServiceInformationServiceInformationUsingGetResponse;
};

export type PublicServiceInformationUsingGetParams = {
  page?: number;
  page_size?: number;
  keyword?: string | null;
  type_id?: number | null;
};

export type PublicServiceInformationUsingGetResponse = {
  /** Whether the request was successful */
  success: boolean;
  /** Business status code, 0 = success */
  code: number;
  message: string;
  data: VisitorServiceResource[];
  meta: {
    /** Pagination strategy */
    pagination: string;
    /** Current page number */
    page: number;
    /** Items per page */
    page_size: number;
    /** Whether more pages exist */
    has_more: boolean;
    /** Total number of items */
    total: number;
  };
  /** UUID7 for request tracing */
  request_id: string;
};

export type PublicServiceInformationUsingGetResponses = {
  /**
   * Paginated list
   */
  200: PublicServiceInformationUsingGetResponse;
  /**
   * Unprocessable Content
   */
  422: PublicServiceInformationUsingGetResponse;
  /**
   * Too Many Requests
   */
  429: PublicServiceInformationUsingGetResponse;
  /**
   * Internal Server Error
   */
  500: PublicServiceInformationUsingGetResponse;
};

export type PublicTravelRoutesTravelRouteUsingGetParams = {
  /** The travel route ID */
  travelRoute: number;
};

export type PublicTravelRoutesTravelRouteUsingGetResponse = {
  /** Whether the request was successful */
  success: boolean;
  /** Business status code, 0 = success */
  code: number;
  message: string;
  data: {
    travel_route: TourismRouteResource;
  };
  /** UUID7 for request tracing */
  request_id: string;
};

export type PublicTravelRoutesTravelRouteUsingGetResponses = {
  200: PublicTravelRoutesTravelRouteUsingGetResponse;
  /**
   * Not Found
   */
  404: PublicTravelRoutesTravelRouteUsingGetResponse;
  /**
   * Too Many Requests
   */
  429: PublicTravelRoutesTravelRouteUsingGetResponse;
  /**
   * Internal Server Error
   */
  500: PublicTravelRoutesTravelRouteUsingGetResponse;
};

export type PublicTravelRoutesUsingGetParams = {
  page?: number;
  page_size?: number;
  keyword?: string | null;
  is_recommended?: boolean;
};

export type PublicTravelRoutesUsingGetResponse = {
  /** Whether the request was successful */
  success: boolean;
  /** Business status code, 0 = success */
  code: number;
  message: string;
  data: TourismRouteResource[];
  meta: {
    /** Pagination strategy */
    pagination: string;
    /** Current page number */
    page: number;
    /** Items per page */
    page_size: number;
    /** Whether more pages exist */
    has_more: boolean;
    /** Total number of items */
    total: number;
  };
  /** UUID7 for request tracing */
  request_id: string;
};

export type PublicTravelRoutesUsingGetResponses = {
  /**
   * Paginated list
   */
  200: PublicTravelRoutesUsingGetResponse;
  /**
   * Unprocessable Content
   */
  422: PublicTravelRoutesUsingGetResponse;
  /**
   * Too Many Requests
   */
  429: PublicTravelRoutesUsingGetResponse;
  /**
   * Internal Server Error
   */
  500: PublicTravelRoutesUsingGetResponse;
};

export type PublishedContentResource = {
  id: number;
  title: string;
  subtitle: string | null;
  summary: string | null;
  /** Sanitized limited HTML. Supports paragraphs, line breaks, headings, emphasis, lists, blockquotes, links, images, video, and audio. Media never autoplays. */
  content: string;
  category: {
    id: number;
    name: string;
  } | null;
  cover: {
    url: string | null;
    width: number | null;
    height: number | null;
  } | null;
  source: string | null;
  author: string | null;
  published_at: string | null;
  relations?: ArticleRelationLinkResource[];
};

export type QueryComplaintRequest = {
  ticket_no: string;
  query_credential: string;
};

export type QueryConsultationRequest = {
  ticket_no: string;
  query_credential: string;
};

export enum RatingEnum {
  'helpful' = 'helpful',
  'unhelpful' = 'unhelpful',
}

export type IRatingEnum = keyof typeof RatingEnum;

export enum RatingEnum2 {
  'helpful' = 'helpful',
  'unhelpful' = 'unhelpful',
}

export type IRatingEnum2 = keyof typeof RatingEnum2;

export enum Relation_typeEnum {
  'attraction' = 'attraction',
  'scenic_spot' = 'scenic_spot',
  'travel_route' = 'travel_route',
  'restaurant' = 'restaurant',
  'accommodation' = 'accommodation',
}

export type IRelation_typeEnum = keyof typeof Relation_typeEnum;

export enum StatusEnum {
  'pending' = 'pending',
  'processing' = 'processing',
  'resolved' = 'resolved',
  'closed' = 'closed',
}

export type IStatusEnum = keyof typeof StatusEnum;

export enum StatusEnum2 {
  'pending' = 'pending',
  'processing' = 'processing',
  'replied' = 'replied',
  'closed' = 'closed',
}

export type IStatusEnum2 = keyof typeof StatusEnum2;

export type StoreComplaintEvidenceRequest = {
  file: string;
};

export type StoreComplaintRequest = {
  category_id: number;
  contact_name: string;
  contact_mobile?: string | null;
  contact_email?: string | null;
  target_type?: string | null;
  target_name: string;
  title: string;
  content: string;
  evidence?: {
    file_id: number;
    upload_token: string;
  }[];
};

export type StoreConsultationRequest = {
  category_id: number;
  contact_name: string;
  contact_mobile?: string | null;
  contact_email?: string | null;
  subject: string;
  content: string;
};

export type SubmitPublicAiFeedbackRequest = {
  message_reference: string;
  rating: 'helpful' | 'unhelpful';
  category_id: number;
};

export enum Target_typeEnum {
  'attraction' = 'attraction',
  'scenic_spot' = 'scenic_spot',
  'travel_route' = 'travel_route',
}

export type ITarget_typeEnum = keyof typeof Target_typeEnum;

export type TourismAreaResource = {
  id: number;
  name: string;
  summary: string | null;
  description: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  cover: {
    url: string | null;
    width: number | null;
    height: number | null;
  } | null;
  phone: string | null;
  opening_hours: string | null;
  ticket_info: string | null;
  scenic_spots?: TourismDestinationResource[];
};

export type TourismDestinationResource = {
  id: number;
  name: string;
  summary: string | null;
  description: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  cover: {
    url: string | null;
    width: number | null;
    height: number | null;
  } | null;
  phone: string | null;
  opening_hours: string | null;
};

export type TourismRouteNodeResource = {
  node_type: 'attraction' | 'scenic_spot';
  position: number;
  stay_minutes: number | null;
  note: string | null;
  target: TourismAreaResource | TourismDestinationResource;
};

export type TourismRouteResource = {
  id: number;
  name: string;
  summary: string | null;
  description: string | null;
  cover: {
    url: string | null;
    width: number | null;
    height: number | null;
  } | null;
  duration_minutes: number | null;
  nodes?: TourismRouteNodeResource[];
};

export type VisitorServiceResource = {
  id: number;
  title: string;
  type: {
    id: number;
    name: string;
  } | null;
  provider: string | null;
  service_area: string | null;
  summary: string | null;
  content: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  service_hours: string | null;
  cover: {
    url: string;
    width: number | null;
    height: number | null;
  } | null;
  attachments: {
    name: string;
    url: string;
  }[];
};
