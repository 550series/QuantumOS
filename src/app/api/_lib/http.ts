import { NextResponse } from 'next/server';

/**
 * issue #50 统一错误响应格式：{ error: string, code: number }
 */
export interface ErrorBody {
  error: string;
  code: number;
}

export function jsonError(message: string, code: number, status: number): NextResponse<ErrorBody> {
  return NextResponse.json({ error: message, code }, { status });
}

export function badRequest(message = 'Invalid JSON body'): NextResponse<ErrorBody> {
  return jsonError(message, 400, 400);
}

export function notFound(message = 'Resource not found'): NextResponse<ErrorBody> {
  return jsonError(message, 404, 404);
}

export function internalError(message = 'Internal Server Error'): NextResponse<ErrorBody> {
  return jsonError(message, 500, 500);
}

/**
 * 安全解析 request.json()。解析失败返回 400，避免抛出未捕获异常导致 500。
 */
export async function parseJsonSafe<T>(
  request: Request
): Promise<{ ok: true; body: T } | { ok: false; response: NextResponse }> {
  try {
    const body = (await request.json()) as T;
    return { ok: true, body };
  } catch {
    return { ok: false, response: badRequest() };
  }
}

/**
 * 包裹 async handler，任何已知/未知异常都返回统一错误响应而不是裸 500。
 */
export function withErrorHandling(handler: () => Promise<NextResponse>): Promise<NextResponse> {
  return handler().catch((err) => {
    console.error('[API] Unhandled error:', err);
    return internalError();
  });
}