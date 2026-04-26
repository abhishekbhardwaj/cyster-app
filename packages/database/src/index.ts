export { prisma, createPrismaClient, type PrismaType, type CreatePrismaClientOptions } from './client'

// Re-export all generated types (model types, enums, Prisma namespace, PrismaClient class)
export * from '../generated/prisma/client.js'

// Re-export detailed model types (DefaultArgs, GetPayload, etc.)
export type * from '../generated/prisma/models.js'
