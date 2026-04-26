import { PrismaPg } from '@prisma/adapter-pg'
import { env } from '@repo/env/backend'
import type pg from 'pg'

import { PrismaClient, type Prisma } from '../generated/prisma/client.js'

// ============================================
// FACTORY
// ============================================

export interface CreatePrismaClientOptions {
  connectionString: string
  /** Connection timeout in milliseconds. Default: 5000 */
  connectionTimeoutMillis?: pg.PoolConfig['connectionTimeoutMillis']
  /** Idle timeout in milliseconds. Default: 30000 */
  idleTimeoutMillis?: pg.PoolConfig['idleTimeoutMillis']
  /** Prisma log levels. Default: ['error'] */
  log?: Prisma.LogLevel[]
}

/**
 * Create a new PrismaClient with a custom connection configuration.
 * Use this when you need a client with non-default settings (e.g., different database, pool config).
 *
 * For the default singleton, import `prisma` instead.
 */
export const createPrismaClient = ({
  connectionString,
  connectionTimeoutMillis = 5000,
  idleTimeoutMillis = 30000,
  log = ['error'],
}: CreatePrismaClientOptions) =>
  new PrismaClient({
    adapter: new PrismaPg({
      connectionString,
      connectionTimeoutMillis,
      idleTimeoutMillis,
    }),
    log,
  })

// ============================================
// SINGLETON
// ============================================

export type PrismaType = ReturnType<typeof createPrismaClient>

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaType | undefined
}

/**
 * Default singleton Prisma client, configured from environment variables.
 *
 * Pool sizing guidelines:
 * - Formula: num_physical_cpus * 2 + 1 (PostgreSQL recommendation)
 * - Default pg pool size is 10, which is often too low for production
 * - Each PostgreSQL connection spawns a new process (~10MB RAM per connection)
 *
 * @see https://wiki.postgresql.org/wiki/Number_Of_Database_Connections
 * @see https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections/connection-pool
 */
export const prisma =
  globalForPrisma.prisma ??
  createPrismaClient({
    connectionString: env.DATABASE_URL,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
