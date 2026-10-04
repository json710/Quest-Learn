import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import { fileURLToPath } from 'node:url'

import { errorHandler, notFound } from './middleware/error.middleware.js'
import apiRouter from './routes/index.js'

const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json({ limit: '10kb' }))
app.use(morgan('dev'))
app.get('/health', (req, res) => res.json({ status: 'ok' }))
app.use('/api', apiRouter)
app.use('/api', notFound)

if (process.env.NODE_ENV === 'production') {
  const frontendDirectory = fileURLToPath(new URL('../../frontend/dist/', import.meta.url))
  app.use(express.static(frontendDirectory))
  app.get('/{*path}', (req, res, next) => {
    if (!req.accepts('html')) return next()
    res.sendFile('index.html', { root: frontendDirectory })
  })
}
app.use(notFound)
app.use(errorHandler)

export default app
