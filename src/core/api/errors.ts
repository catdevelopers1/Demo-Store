import { ZodError } from 'zod';
import { createErrorResponse, APIErrorDetail } from './response';
import { defaultLogger } from './logger';

/**
 * Handles Zod validation errors and returns a standardized 400 response
 */
export function handleZodError(error: ZodError, requestId?: string): Response {
  const details: APIErrorDetail[] = error.errors.map((err) => ({
    field: err.path.join('.'),
    issue: err.message,
  }));

  return createErrorResponse(
    'VALIDATION_ERROR',
    'Request validation failed. Please check field formatting and try again.',
    details,
    400,
    requestId
  );
}

/**
 * Global Edge API error handler for unhandled exceptions
 */
export function handleApiError(error: unknown, requestId?: string): Response {
  if (error instanceof ZodError) {
    return handleZodError(error, requestId);
  }

  defaultLogger.error('Unhandled Edge API exception', {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });

  return createErrorResponse(
    'INTERNAL_ERROR',
    'An unexpected server error occurred on the Edge Worker.',
    undefined,
    500,
    requestId
  );
}
