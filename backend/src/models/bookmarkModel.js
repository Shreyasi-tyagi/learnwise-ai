const mongoose = require('mongoose')

const bookmarkSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  title: { type: String, required: true },
  type: { type: String },
  difficulty: { type: String },
  duration: { type: String },
  reason: { type: String },
  url: { type: String },
  source: { type: String },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})

bookmarkSchema.index({ user_id: 1, title: 1 }, { unique: true })

const Bookmark = mongoose.model('Bookmark', bookmarkSchema)

function toPublicBookmark(doc) {
  if (!doc) return null
  return {
    id: doc._id.toString(),
    title: doc.title,
    type: doc.type,
    difficulty: doc.difficulty,
    duration: doc.duration,
    reason: doc.reason,
    url: doc.url,
    source: doc.source,
    createdAt: doc.created_at,
  }
}

async function addBookmark({ userId, title, type, difficulty, duration, reason, url, source }) {
  const bookmark = await Bookmark.findOneAndUpdate(
    { user_id: userId, title },
    { 
      type: type || null,
      difficulty: difficulty || null,
      duration: duration || null,
      reason: reason || null,
      url: url || null,
      source: source || null,
    },
    { returnDocument: 'after', upsert: true }
  )
  return toPublicBookmark(bookmark)
}

async function listBookmarksByUser(userId) {
  const bookmarks = await Bookmark.find({ user_id: userId }).sort({ created_at: -1 })
  return bookmarks.map(toPublicBookmark)
}

async function removeBookmark(id, userId) {
  const result = await Bookmark.deleteOne({ _id: id, user_id: userId })
  return result.deletedCount > 0
}

module.exports = {
  addBookmark,
  listBookmarksByUser,
  removeBookmark,
}
