const mongoose = require('mongoose')

const progressSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  category: { type: String, required: true },
  item_key: { type: String, required: true },
  label: { type: String },
  status: { type: String, required: true, default: 'completed' },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})

// Add a compound unique index
progressSchema.index({ user_id: 1, category: 1, item_key: 1 }, { unique: true })

const Progress = mongoose.model('ProgressItem', progressSchema)

function toPublicProgress(doc) {
  if (!doc) return null
  return {
    id: doc._id.toString(),
    category: doc.category,
    itemKey: doc.item_key,
    label: doc.label,
    status: doc.status,
    updatedAt: doc.updated_at,
  }
}

async function upsertProgress({ userId, category, itemKey, label, status }) {
  const progress = await Progress.findOneAndUpdate(
    { user_id: userId, category, item_key: itemKey },
    { 
      label: label || null,
      status: status || 'completed',
    },
    { returnDocument: 'after', upsert: true }
  )
  return toPublicProgress(progress)
}

async function listProgressByUser(userId) {
  const progressList = await Progress.find({ user_id: userId }).sort({ updated_at: -1 })
  return progressList.map(toPublicProgress)
}

async function getProgressSummary(userId) {
  const result = await Progress.aggregate([
    { $match: { user_id: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: { category: '$category', status: '$status' },
        count: { $sum: 1 }
      }
    }
  ])

  const summary = {}
  for (const row of result) {
    const category = row._id.category
    const status = row._id.status
    const count = row.count

    if (!summary[category]) {
      summary[category] = { total: 0 }
    }
    summary[category][status] = count
    summary[category].total += count
  }

  return summary
}

module.exports = {
  upsertProgress,
  listProgressByUser,
  getProgressSummary,
}
