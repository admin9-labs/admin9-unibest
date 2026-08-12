/* eslint-disable */
// @ts-ignore

export type ArticleRelationLinkResource = {
  relation_type:
    | 'attraction'
    | 'scenic_spot'
    | 'travel_route'
    | 'restaurant'
    | 'accommodation';
  position: number;
  target: {
    code: string;
    name: string;
  };
};

export type AudioGuidePlaybackResource = {
  code: string;
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
    code: string;
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

export type DiningPlaceResource = {
  code: string;
  name: string;
  summary: string | null;
  description: string | null;
  category: {
    code: string;
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
    code: string;
    name: string;
  } | null;
  scenic_spot?: {
    code: string;
    name: string;
  } | null;
};

export type LodgingPlaceResource = {
  code: string;
  name: string;
  summary: string | null;
  description: string | null;
  category: {
    code: string;
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
    code: string;
    name: string;
  } | null;
  scenic_spot?: {
    code: string;
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
  accommodation: string;
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
  category_code?: string | null;
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

export type PublicArticlesArticleUsingGetParams = {
  article: string;
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
  category_code?: string | null;
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
  attraction: string;
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
  audioGuide: string;
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
  target_code?: string | null;
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

export type PublicRestaurantsRestaurantUsingGetParams = {
  restaurant: string;
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
  category_code?: string | null;
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
  scenicSpot: string;
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

export type PublicTravelRoutesTravelRouteUsingGetParams = {
  travelRoute: string;
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
  code: string;
  title: string;
  subtitle: string | null;
  summary: string | null;
  content: string;
  category: {
    code: string;
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

export enum Relation_typeEnum {
  'attraction' = 'attraction',
  'scenic_spot' = 'scenic_spot',
  'travel_route' = 'travel_route',
  'restaurant' = 'restaurant',
  'accommodation' = 'accommodation',
}

export type IRelation_typeEnum = keyof typeof Relation_typeEnum;

export enum Target_typeEnum {
  'attraction' = 'attraction',
  'scenic_spot' = 'scenic_spot',
  'travel_route' = 'travel_route',
}

export type ITarget_typeEnum = keyof typeof Target_typeEnum;

export type TourismAreaResource = {
  code: string;
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
  code: string;
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
  code: string;
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
