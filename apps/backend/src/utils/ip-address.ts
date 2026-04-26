/* eslint-disable sonarjs/empty-string-repetition */
/* eslint-disable sonarjs/regex-complexity */
/* eslint-disable sonarjs/no-empty-alternatives */
/**
 * IP address utilities for Hono.js
 * Adapted from request-ip (https://github.com/pbojinov/request-ip)
 */

/**
 * Regular expressions for validating IP addresses
 */
const regexes = {
  ipv4: /^(?:(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.){3}(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])$/,
  ipv6: /^((?=.*::)(?!.*::.+::)(::)?([\dA-F]{1,4}:(:|\b)|){5}|([\dA-F]{1,4}:){6})((([\dA-F]{1,4}((?!\3)::|:\b|$))|(?!\2\3)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4})$/i,
}

/**
 * Checks if a value is defined (not null or undefined)
 */
function existy(value: unknown): boolean {
  return value != null
}

/**
 * Checks if a value is a valid IP address (IPv4 or IPv6)
 */
function isIp(value: unknown): value is string {
  return existy(value) && typeof value === 'string' && (regexes.ipv4.test(value) || regexes.ipv6.test(value))
}

/**
 * Checks if a value is a string
 */
function isString(value: unknown): boolean {
  return Object.prototype.toString.call(value) === '[object String]'
}

/**
 * Parse x-forwarded-for headers to extract client IP
 */
export function getClientIpFromXForwardedFor(value: unknown): string | null {
  if (!existy(value)) {
    return null
  }

  if (!isString(value)) {
    throw new TypeError(`Expected a string, got "${typeof value}"`)
  }

  // x-forwarded-for may return multiple IP addresses in the format:
  // "client IP, proxy 1 IP, proxy 2 IP"
  // Therefore, the left-most IP address is the IP address of the originating client
  const forwardedIps = (value as string).split(',').map((e) => {
    const ip = e.trim()
    if (ip.includes(':')) {
      const splitted = ip.split(':')
      // make sure we only use this if it's ipv4 (ip:port)
      if (splitted.length === 2) {
        return splitted[0] ?? ip
      }
    }
    return ip
  })

  // Find the first valid IP address in the list
  for (const ip of forwardedIps) {
    if (isIp(ip)) {
      return ip
    }
  }

  return null
}

/**
 * Get client IP address from Hono request
 */
export function getClientIp(req: Request): string | null {
  // Extract headers safely
  const headers: Record<string, string> = {}
  req.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value
  })

  // Standard headers used by Amazon EC2, Heroku, and others
  if (isIp(headers['x-client-ip'])) {
    return headers['x-client-ip']
  }

  // Load-balancers (AWS ELB) or proxies
  const xForwardedFor = getClientIpFromXForwardedFor(headers['x-forwarded-for'])
  if (isIp(xForwardedFor)) {
    return xForwardedFor
  }

  // Cloudflare
  if (isIp(headers['cf-connecting-ip'])) {
    return headers['cf-connecting-ip']
  }

  // DigitalOcean
  if (isIp(headers['do-connecting-ip'])) {
    return headers['do-connecting-ip']
  }

  // Fastly and Firebase hosting header
  if (isIp(headers['fastly-client-ip'])) {
    return headers['fastly-client-ip']
  }

  // Akamai and Cloudflare
  if (isIp(headers['true-client-ip'])) {
    return headers['true-client-ip']
  }

  // Default nginx proxy/fcgi
  if (isIp(headers['x-real-ip'])) {
    return headers['x-real-ip']
  }

  // Rackspace LB and Riverbed's Stingray
  if (isIp(headers['x-cluster-client-ip'])) {
    return headers['x-cluster-client-ip']
  }

  if (isIp(headers['x-forwarded'])) {
    return headers['x-forwarded']
  }

  if (isIp(headers['forwarded-for'])) {
    return headers['forwarded-for']
  }

  if (isIp(headers.forwarded)) {
    return headers.forwarded
  }

  // Google Cloud App Engine
  if (isIp(headers['x-appengine-user-ip'])) {
    return headers['x-appengine-user-ip']
  }

  // Cloudflare fallback
  if (isIp(headers['cf-pseudo-ipv4'])) {
    return headers['cf-pseudo-ipv4']
  }

  // For Hono with Node adapter, we can try to get the IP from the connection info
  // This would be handled by the adapter-specific code that calls this function

  return null
}
