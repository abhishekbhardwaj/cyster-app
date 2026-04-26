import { ResponseCode } from '@/utils/constants'

import BaseException from './base-exception'

class AuthenticationException extends BaseException {
  constructor() {
    super(401, { message: 'Unauthorized' })
    this.code = ResponseCode.UNAUTHORIZED
  }
}

export default AuthenticationException
