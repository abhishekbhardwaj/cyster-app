import { exec } from 'node:child_process'
import { resolve } from 'node:path'
import { promisify } from 'node:util'

import { prisma, type PrismaType } from '@repo/database'
import { env } from '@repo/env/backend'

const execAsync = promisify(exec)
const prismaBinary = 'bunx prisma'

/** Resolve to @repo/database package root so prisma CLI finds prisma.config.ts */
const databasePackageDir = resolve(import.meta.dirname, '../../../../packages/database')

export class TestDatabase {
  public prisma: PrismaType

  constructor() {
    this.prisma = prisma
  }

  async teardown() {
    await this.teardownDatabase()
    await this.prisma.$disconnect()
  }

  async setupDatabase() {
    const connectionString = env.DATABASE_URL

    if (connectionString.startsWith('file:') || connectionString.startsWith('sqlite:')) {
      await execAsync(`${prismaBinary} db push --skip-generate --force-reset`, { cwd: databasePackageDir })
    } else if (connectionString.startsWith('postgresql:') || connectionString.startsWith('mysql:')) {
      await execAsync(`${prismaBinary} migrate deploy`, { cwd: databasePackageDir })
    } else {
      throw new Error('Unsupported database connection string')
    }
  }

  async teardownDatabase() {
    const connectionString = env.DATABASE_URL

    try {
      await this.truncateDatabase()

      if (connectionString.startsWith('file:') || connectionString.startsWith('sqlite:')) {
        await this.deleteAllTablesSQLite()
      } else if (connectionString.startsWith('mysql:')) {
        await this.deleteAllTablesMySQL()
      } else if (connectionString.startsWith('postgresql:')) {
        await this.deleteAllTablesPostgreSQL()
      } else {
        throw new Error('Unsupported database connection string')
      }
    } catch (error) {
      console.error('Error during table deletion:', error)
      throw error
    }
  }

  async truncateDatabase() {
    const connectionString = env.DATABASE_URL

    if (connectionString.startsWith('file:') || connectionString.startsWith('sqlite:')) {
      await this.truncateSQLite()
    } else if (connectionString.startsWith('mysql:')) {
      await this.truncateMySQL()
    } else if (connectionString.startsWith('postgresql:')) {
      await this.truncatePostgreSQL()
    } else {
      throw new Error('Unsupported database connection string')
    }
  }

  private async deleteAllTablesSQLite() {
    const tables = await this.prisma.$queryRaw<{ name: string }[]>`
      SELECT name FROM sqlite_master
      WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_%';
    `
    for (const { name } of tables) {
      await this.prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "${name}";`)
    }
  }

  private async deleteAllTablesMySQL() {
    await this.prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 0;`
    const tables = await this.prisma.$queryRaw<{ TABLE_NAME: string }[]>`
      SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME NOT LIKE '_prisma_%';
    `
    for (const { TABLE_NAME } of tables) {
      await this.prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS \`${TABLE_NAME}\`;`)
    }
    await this.prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 1;`
  }

  private async deleteAllTablesPostgreSQL() {
    await this.prisma.$executeRaw`
      DO $$
      DECLARE
          r RECORD;
      BEGIN
          FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename NOT LIKE '_prisma_%')
          LOOP
              EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
          END LOOP;
      END $$;
    `
  }

  private async truncateSQLite() {
    await this.prisma.$executeRaw`DELETE FROM sqlite_sequence;`
    const tables = await this.prisma.$queryRaw<{ name: string }[]>`
      SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';
    `
    for (const { name } of tables) {
      await this.prisma.$executeRawUnsafe(`DELETE FROM "${name}";`)
    }
  }

  private async truncateMySQL() {
    await this.prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 0;`
    const tables = await this.prisma.$queryRaw<{ TABLE_NAME: string }[]>`
      SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE();
    `
    for (const { TABLE_NAME } of tables) {
      await this.prisma.$executeRawUnsafe(`TRUNCATE TABLE \`${TABLE_NAME}\`;`)
    }
    await this.prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 1;`
  }

  private async truncatePostgreSQL() {
    await this.prisma.$executeRaw`
      DO $$
      DECLARE
          row record;
      BEGIN
          -- Disable all triggers temporarily
          SET session_replication_role = 'replica';

          FOR row IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public')
          LOOP
              EXECUTE 'TRUNCATE TABLE ' || quote_ident(row.tablename) || ' CASCADE';
          END LOOP;

          -- Re-enable triggers
          SET session_replication_role = 'origin';
      END $$;
    `

    await this.prisma.$executeRaw`
      DO $$
      DECLARE
          row record;
      BEGIN
          FOR row IN (SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public')
          LOOP
              EXECUTE 'ALTER SEQUENCE ' || quote_ident(row.sequence_name) || ' RESTART WITH 1';
          END LOOP;
      END $$;
    `
  }
}
