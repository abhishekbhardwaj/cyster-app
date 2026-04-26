import { HTTPException } from 'hono/http-exception'

import { ResponseCode } from '@/utils/constants'

/**
 * Overriding the default HTTPException class to include a code property and to customize the response.
 * Ref: https://hono.dev/docs/api/exception
 */
class BaseException extends HTTPException {
  public code: ResponseCode

  constructor(status: HTTPException['status'] = 500, options: ConstructorParameters<typeof HTTPException>[1] = {}) {
    super(status, options)
    this.code = ResponseCode.INTERNAL_SERVER_ERROR
  }

  getResponse(): Response {
    return new Response(
      JSON.stringify({
        code: this.code,
        message: this.message,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: this.status,
      },
    )
  }
}

export default BaseException
