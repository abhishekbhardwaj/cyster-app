export enum ResponseCode {
  SUCCESS = 'success',
  HEALTH_CHECK_FAILED = 'health_check_failed',
  PAYLOAD_TOO_LARGE = 'payload_too_large',

  // Errors
  VALIDATION_ERROR = 'validation_error',
  BAD_REQUEST = 'bad_request',
  UNAUTHORIZED = 'unauthorized',
  FORBIDDEN = 'forbidden',
  NOT_FOUND = 'not_found',
  INTERNAL_SERVER_ERROR = 'internal_server_error',

  // Application
  ORGANIZATION_NOT_FOUND = 'organization_not_found',
  CANNOT_ACCESS_ORGANIZATION = 'cannot_access_organization',
  API_KEY_NOT_FOUND = 'api_key_not_found',
  RESOURCE_ALREADY_EXISTS = 'resource_already_exists',
}

// These are for displaying the tags in the OpenAPI Spec UI
export enum OpenAPITag {
  USER = 'User',
  ORGANIZATION = 'Organization',
  ORGANIZATION_API_KEYS = 'Organization API Keys',
  STATIC = 'Static',
}

export enum TeamUserRole {
  ADMINISTRATOR = 'administrator',
  MEMBER = 'member',
}

export enum RoutePrefix {
  HEALTH = '/health',
  DEVELOPER = '/',
  BACKOFFICE = '/back-office',
  APP_SERVICE = '/app-service',
}

export enum OpenAPIRoute {
  JSON = '/openapi.json',
  UI = '/openapi',
}

/**
 * Default trusted origins for CORS. Use `calculateTrustedInboundOrigins()` from
 * `@/utils/cors` to get the full list including env-configured origins.
 */
export const TrustedInboundOrigins = ['http://localhost:3939', 'https://localhost:3939']
