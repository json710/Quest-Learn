import 'dotenv/config'

import app from './app.js'
import { prisma } from './config/database.js'
import { validateEnvironment } from './config/env.js'

const { port } = validateEnvironment()

const server = app.listen(port, (error) => {
  if (error) {
    console.error(`Unable to start QuestLearn API: ${error.message}`)
    process.exitCode = 1
    return
  }

  console.log(`QuestLearn API listening on http://localhost:${port}`)
})

let isShuttingDown = false

const shutdown = () => {
  if (isShuttingDown) return
  isShuttingDown = true

  server.close(async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
