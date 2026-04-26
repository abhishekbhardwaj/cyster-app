import { describe, expect, test } from 'bun:test'
import { emailMocks } from 'tests/__mocks__'
import { APITestClient } from 'tests/__reusable-test-utilities__/api-test-client'
import { type z } from 'zod'

import app from '@/app'
import { type ContactFormResponseSchema } from '@/routers/app-service/static/contact'
import { ResponseCode, RoutePrefix } from '@/utils/constants'
import { type ApiResponse, type ValidationError } from '@/utils/hono'

type ContactFormResponse = z.infer<typeof ContactFormResponseSchema>

describe('Contact Form API', () => {
  const client = new APITestClient(app)

  describe('POST /api/app-service/contact', () => {
    test('should successfully submit contact form with valid data', async () => {
      // Given: valid contact form data
      const contactData = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello, this is a test message',
      }

      // When: submitting the contact form
      const response = await client.post<ApiResponse<ContactFormResponse>>(
        `${RoutePrefix.APP_SERVICE}/contact`,
        contactData,
      )

      // Then: should return success response
      expect(response.status).toBe(200)
      expect(response.body?.code).toBe(ResponseCode.SUCCESS)
      expect(response.body?.message).toBe('Contact form submitted successfully')
      expect(response.body?.data).toEqual({ success: true })
    })

    test('should return 400 for invalid email format', async () => {
      // Given: invalid email format
      const contactData = {
        name: 'John Doe',
        email: 'invalid-email',
        message: 'Hello, this is a test message',
      }

      // When: submitting the contact form
      const response = await client.post<ApiResponse>(`${RoutePrefix.APP_SERVICE}/contact`, contactData)

      // Then: should return 400 error
      expect(response.status).toBe(400)
    })

    test('should return 400 for missing required fields', async () => {
      // Given: missing required fields
      const contactData = {
        name: 'John Doe',
        // email missing
        message: 'Hello, this is a test message',
      }

      // When: submitting the contact form
      const response = await client.post<ApiResponse>(`${RoutePrefix.APP_SERVICE}/contact`, contactData)

      // Then: should return 400 error
      expect(response.status).toBe(400)
    })

    test('should reject empty string values (schema requires non-empty strings)', async () => {
      // Given: empty string values (schema rejects empty strings)
      const contactData = {
        name: '',
        email: 'john@example.com',
        message: '',
      }

      // When: submitting the contact form
      const response = await client.post<ApiResponse<ContactFormResponse>>(
        `${RoutePrefix.APP_SERVICE}/contact`,
        contactData,
      )

      // Then: should return 400 validation error
      expect(response.status).toBe(400)
      expect(response.body?.code).toBe(ResponseCode.VALIDATION_ERROR)
    })

    test('should call email service with correct parameters', async () => {
      // Given: valid contact form data
      const contactData = {
        name: 'Jane Smith',
        email: 'jane@example.com',
        message: 'This is a test inquiry',
      }

      // When: submitting the contact form
      await client.post<ApiResponse<ContactFormResponse>>(`${RoutePrefix.APP_SERVICE}/contact`, contactData)

      // Then: email service should be called with correct parameters
      expect(emailMocks.contact).toHaveBeenCalledWith({
        to: 'abhishek@instantlycreative.com',
        name: contactData.name,
        email: contactData.email,
        message: contactData.message,
      })
    })

    test('should return detailed validation errors in correct format', async () => {
      // Given: invalid data with multiple validation errors
      const contactData = {
        name: '',
        email: 'invalid-email',
        message: '',
      }

      // When: submitting the contact form
      const response = await client.post<ApiResponse<ValidationError[]>>(
        `${RoutePrefix.APP_SERVICE}/contact`,
        contactData,
      )

      // Then: should return 400 with detailed validation errors
      expect(response.status).toBe(400)
      expect(response.body?.code).toBe(ResponseCode.VALIDATION_ERROR)
      expect(response.body?.data).toBeInstanceOf(Array)
      expect(response.body?.data?.length).toBeGreaterThan(0)

      // Should have proper ValidationError structure
      const errors = response.body?.data ?? []
      errors.forEach((error) => {
        expect(error).toHaveProperty('code')
        expect(error).toHaveProperty('message')
        expect(error).toHaveProperty('path')
        expect(typeof error.code).toBe('string')
        expect(typeof error.message).toBe('string')
        expect(Array.isArray(error.path)).toBe(true)
      })
    })
  })
})
