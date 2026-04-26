import { type ApiKeyDefaultArgs, type ApiKeyGetPayload } from '@repo/database'

export const ApiKeyIncludes = {
  include: {
    organization: true,
  },
} satisfies ApiKeyDefaultArgs

export type ApiKeyWithOrganization = ApiKeyGetPayload<typeof ApiKeyIncludes>
