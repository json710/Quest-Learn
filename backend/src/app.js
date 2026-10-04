import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'

import { errorHandler, notFound } from './middleware/error.middleware.js'
import apiRouter from './routes/index.js'

const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json({ limit: '10kb' }))
app.use(morgan('dev'))
app.use('/api', apiRouter)
app.use(notFound)
app.use(errorHandler)

export default app
