require('dotenv').config()
const { createApp } = require('./app')
const { ensureDatabaseConnection } = require('./config/db')


const PORT = Number(process.env.PORT) || 5000
const app = createApp()

async function startServer() {
  await ensureDatabaseConnection()


  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })
}

startServer().catch((error) => {
  console.error('Failed to start server', error)
  process.exit(1)
})
