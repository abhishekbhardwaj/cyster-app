import { type Hono } from 'hono'

import { type HonoContextType } from '@/utils/hono'

import { createBaseData, type TestData } from './data-seeding'
import { TestDatabase } from './test-database'

export class APITestClient extends TestDatabase {
  public app: Hono<HonoContextType>
  public env: Record<string, unknown>
  public users: TestData[]
  private requestAsUser: TestData | null
  private apiKey: string | undefined
  private includeAPIKeyFlag: boolean

  constructor(app: Hono<HonoContextType>, env: Record<string, unknown> = {}) {
    super()
    this.app = app
    this.env = { ...this.env, ...env }
    this.users = []
  }

  setAPIKey(key: string) {
    this.apiKey = key
  }

  includeAPIKey() {
    this.includeAPIKeyFlag = true
    return this
  }

  setRequestAsUser(user: TestData | null) {
    this.includeAPIKeyFlag = false
    this.requestAsUser = user
    return this
  }

  private getHeaders(additionalHeaders: Record<string, string> = {}): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...additionalHeaders,
    }

    if (this.includeAPIKeyFlag && this.apiKey) {
      headers.Authorization = `Bearer ${this.apiKey}`
    }

    this.includeAPIKeyFlag = false

    return headers
  }

  async request<T = unknown>(
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    options: Omit<RequestInit, 'body'> & { body?: unknown } = {},
    env?: Record<string, unknown>,
  ): Promise<{
    headers: Headers
    status: number
    body: T | null
    response: Response
  }> {
    env = { ...this.env, ...env }
    const { body, headers: optionHeaders, ...restOptions } = options
    const headers = this.getHeaders(optionHeaders as Record<string, string>)

    if (this.requestAsUser) {
      const result = await new Promise<{
        headers: Headers
        status: number
        body: T | null
        response: Response
        // eslint-disable-next-line no-async-promise-executor, @typescript-eslint/no-misused-promises
      }>(async (resolve) =>
        this.requestAsUser?.betterAuth.$fetch(url, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
          ...restOptions,
          onResponse: async ({ response }) => {
            let responseBody: T | null = null
            try {
              responseBody = (await response.clone().json()) as T
            } catch {
              // If the response is not JSON, we leave the body as null
            }

            resolve({
              headers: response.headers,
              status: response.status,
              body: responseBody,
              response,
            })
          },
        }),
      )

      return result
    } else {
      const response = await this.app.request(
        url,
        {
          ...restOptions,
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
        },
        env,
      )

      let responseBody: T | null = null
      try {
        responseBody = (await response.clone().json()) as T
      } catch {
        // If the response is not JSON, we leave the body as null
      }

      return {
        headers: response.headers,
        status: response.status,
        body: responseBody,
        response: response,
      }
    }
  }

  async get<T = unknown>(url: string, options?: Omit<RequestInit, 'body'>) {
    return this.request<T>(url, 'GET', options)
  }

  async post<T = unknown>(url: string, body?: unknown, options?: Omit<RequestInit, 'body'>) {
    return this.request<T>(url, 'POST', { ...options, body })
  }

  async put<T = unknown>(url: string, body?: unknown, options?: Omit<RequestInit, 'body'>) {
    return this.request<T>(url, 'PUT', { ...options, body })
  }

  async patch<T = unknown>(url: string, body?: unknown, options?: Omit<RequestInit, 'body'>) {
    return this.request<T>(url, 'PATCH', { ...options, body })
  }

  async delete<T = unknown>(url: string, body?: unknown, options?: Omit<RequestInit, 'body'>) {
    return this.request<T>(url, 'DELETE', { ...options, body })
  }

  async truncateDatabaseAndSeed() {
    await this.truncateDatabase()
    this.users = await createBaseData(this.prisma, this.app)
  }
}
