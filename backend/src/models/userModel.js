const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})

const User = mongoose.model('User', userSchema)

function toPublicUser(doc) {
  if (!doc) return null
  return {
    id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    createdAt: doc.created_at,
  }
}

async function createUser({ name, email, passwordHash }) {
  const user = await User.create({ name, email, password_hash: passwordHash })
  return toPublicUser(user)
}

async function findUserByEmail(email) {
  const user = await User.findOne({ email })
  if (!user) return null
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    password_hash: user.password_hash,
    created_at: user.created_at,
  }
}

async function findUserById(id) {
  const user = await User.findById(id)
  return toPublicUser(user)
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  toPublicUser,
}
