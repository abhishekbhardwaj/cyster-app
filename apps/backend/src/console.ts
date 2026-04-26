import 'dotenv/config'

import { Command } from 'commander'
import { showRoutes } from 'hono/dev'

import app from './app'

const program = new Command()

program.name('console').description('Console Script for running commands').version('1.0.0')

program
  .command('routes')
  .description('List all the routes in the application')
  .action(() => showRoutes(app, { verbose: true, colorize: true }))

program.parse()
