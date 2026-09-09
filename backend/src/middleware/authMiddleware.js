const jwt = require('jsonwebtoken')

function getJwtSecret() {
  return process.env.JWT_SECRET || 'learnwise-dev-secret'
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''

  if (!token) {
    return res.status(401).json({ status: 'error', message: 'Authentication required' })
  }

  try {
    const payload = jwt.verify(token, getJwtSecret())
    req.user = {
      id: payload.sub,
      email: payload.email,
    }
    next()
  } catch (error) {
    return res.status(401).json({ status: 'error', message: 'Invalid or expired token' })
  }
}

module.exports = {
  requireAuth,
}
