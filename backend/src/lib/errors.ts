import { NextResponse } from 'next/server';

export interface ApiErrorBody {
  error: string;
  details?: any;
}

export function errorResponse(
  message: string,
  status: number = 400,
  details?: any
): NextResponse<ApiErrorBody> {
  const body: ApiErrorBody = { error: message };
  if (details !== undefined) {
    body.details = details;
  }
  return NextResponse.json(body, { status });
}

export function unauthorizedResponse(message = 'Unauthorized'): NextResponse<ApiErrorBody> {
  return errorResponse(message, 401);
}

export function forbiddenResponse(message = 'Forbidden'): NextResponse<ApiErrorBody> {
  return errorResponse(message, 403);
}

export function notFoundResponse(message = 'Resource not found'): NextResponse<ApiErrorBody> {
  return errorResponse(message, 404);
}

export function badRequestResponse(
  message = 'Invalid request',
  details?: any
): NextResponse<ApiErrorBody> {
  return errorResponse(message, 400, details);
}

export function serverErrorResponse(
  errorOrMessage: unknown = 'Internal server error'
): NextResponse<ApiErrorBody> {
  let message = 'Internal server error';
  if (typeof errorOrMessage === 'string') {
    message = errorOrMessage;
  } else if (errorOrMessage instanceof Error) {
    message = errorOrMessage.message;
  }
  return errorResponse(message, 500);
}

