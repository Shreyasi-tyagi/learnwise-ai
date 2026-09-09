const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { validateRequired } = require('../utils/validate')
const { createUser, findUserByEmail, findUserById, toPublicUser } = require('../models/userModel')

const TOKEN_EXPIRES_IN = '7d'

function getJwtSecret() {
  if (!process.env.JWT_SECRET) {
    console.warn('JWT_SECRET is not set. Using a development-only fallback secret.')
  }

  return process.env.JWT_SECRET || 'learnwise-dev-secret'
}

function createToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, getJwtSecret(), {
    expiresIn: TOKEN_EXPIRES_IN,
  })
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

async function register(req, res, next) {
  try {
    const { valid, missing } = validateRequired(['name', 'email', 'password'], req.body)

    if (!valid) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields',
        missing,
      })
    }

    const name = req.body.name.trim()
    const email = req.body.email.trim().toLowerCase()
    const password = req.body.password

    if (!isValidEmail(email)) {
      return res.status(400).json({ status: 'error', message: 'Please enter a valid email address' })
    }

    if (password.length < 8) {
      return res.status(400).json({ status: 'error', message: 'Password must be at least 8 characters' })
    }

    const existingUser = await findUserByEmail(email)
    if (existingUser) {
      return res.status(409).json({ status: 'error', message: 'An account with this email already exists' })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await createUser({ name, email, passwordHash })

    res.status(201).json({
      status: 'ok',
      message: 'Account created',
      token: createToken(user),
      user,
    })
  } catch (error) {
    next(error)
  }
}

async function login(req, res, next) {
  try {
    const { valid, missing } = validateRequired(['email', 'password'], req.body)

    if (!valid) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields',
        missing,
      })
    }

    const email = req.body.email.trim().toLowerCase()
    const userRecord = await findUserByEmail(email)

    if (!userRecord) {
      return res.status(401).json({ status: 'error', message: 'Invalid email or password' })
    }

    const passwordMatches = await bcrypt.compare(req.body.password, userRecord.password_hash)
    if (!passwordMatches) {
      return res.status(401).json({ status: 'error', message: 'Invalid email or password' })
    }

    const user = {
      id: userRecord.id,
      name: userRecord.name,
      email: userRecord.email,
      createdAt: userRecord.created_at,
    }

    res.json({
      status: 'ok',
      message: 'Logged in',
      token: createToken(user),
      user,
    })
  } catch (error) {
    next(error)
  }
}

async function me(req, res, next) {
  try {
    const user = await findUserById(req.user.id)

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' })
    }

    res.json({
      status: 'ok',
      user,
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  register,
  login,
  me,
}
