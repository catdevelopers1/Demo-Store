export type APIErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'OUT_OF_STOCK'
  | 'COD_LIMIT_EXCEEDED'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'
  | 'BAD_REQUEST';

export interface APIErrorDetail {
  field?: string;
  issue: string;
}

export interface APIErrorPayload {
  code: APIErrorCode;
  message: string;
  details?: APIErrorDetail[];
}

export interface APIMeta {
  timestamp: string;
  requestId?: string;
  page?: number;
  limit?: number;
  total?: number;
}

export interface APISuccessResponse<T> {
  success: true;
  data: T;
  meta: APIMeta;
}

export interface APIErrorResponse {
  success: false;
  error: APIErrorPayload;
  meta: APIMeta;
}

export type APIResponse<T> = APISuccessResponse<T> | APIErrorResponse;

/**
 * Formats a standardized success JSON response for Edge Workers
 */
export function createSuccessResponse<T>(
  data: T,
  meta: Partial<APIMeta> = {},
  status = 200
): Response {
  const payload: APISuccessResponse<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };

  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  });
}

/**
 * Formats a standardized error JSON response for Edge Workers
 */
export function createErrorResponse(
  code: APIErrorCode,
  message: string,
  details?: APIErrorDetail[],
  status = 400,
  requestId?: string
): Response {
  const payload: APIErrorResponse = {
    success: false,
    error: {
      code,
      message,
      details,
    },
    meta: {
      timestamp: new Date().toISOString(),
      ...(requestId ? { requestId } : {}),
    },
  };

  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
