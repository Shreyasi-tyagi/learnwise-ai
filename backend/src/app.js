const express = require('express')
const cors = require('cors')

const healthRoutes = require('./routes/healthRoutes')
const authRoutes = require('./routes/authRoutes')
const learningRoutes = require('./routes/learningRoutes')
const progressRoutes = require('./routes/progressRoutes')
const { notFound, errorHandler } = require('./middleware/errorMiddleware')

function createApp() {
  const app = express()

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      credentials: true,
    }),
  )
  app.use(express.json({ limit: '1mb' }))

  app.use('/api/health', healthRoutes)
  app.use('/api/auth', authRoutes)
  app.use('/api/learning', learningRoutes)
  app.use('/api/progress', progressRoutes)

  app.use(notFound)
  app.use(errorHandler)

  return app
}

module.exports = { createApp }
