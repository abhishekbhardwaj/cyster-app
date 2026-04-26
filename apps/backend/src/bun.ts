import { env } from '@repo/env/backend'

import app from './app'
import { configureLogger, getAppLogger } from './utils/logger'

// Configure logging before starting the server
await configureLogger()

const server = Bun.serve({
  port: env.PORT,
  fetch(request, server) {
    return app.fetch(request, { server })
  },
})

getAppLogger().info('🚀 Server running on port {port}', { port: server.port })
