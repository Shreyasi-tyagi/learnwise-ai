const mongoose = require('mongoose')

const roadmapSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  level: { type: String, required: true },
  goal: { type: String, required: true },
  study_time: { type: String, required: true },
  steps: { type: mongoose.Schema.Types.Mixed, required: true },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})

const Roadmap = mongoose.model('Roadmap', roadmapSchema)

function toPublicRoadmap(doc) {
  if (!doc) return null
  return {
    id: doc._id.toString(),
    level: doc.level,
    goal: doc.goal,
    studyTime: doc.study_time,
    steps: doc.steps,
    createdAt: doc.created_at,
  }
}

async function createRoadmap({ userId, level, goal, studyTime, steps }) {
  const roadmap = await Roadmap.create({
    user_id: userId,
    level,
    goal,
    study_time: studyTime,
    steps,
  })
  return toPublicRoadmap(roadmap)
}

async function listRoadmapsByUser(userId) {
  const roadmaps = await Roadmap.find({ user_id: userId }).sort({ created_at: -1 })
  return roadmaps.map(toPublicRoadmap)
}

async function findRoadmapById(id, userId) {
  const roadmap = await Roadmap.findOne({ _id: id, user_id: userId })
  return toPublicRoadmap(roadmap)
}

async function deleteRoadmap(id, userId) {
  const result = await Roadmap.deleteOne({ _id: id, user_id: userId })
  return result.deletedCount > 0
}

async function updateRoadmap({ id, userId, level, goal, studyTime, steps }) {
  const roadmap = await Roadmap.findOneAndUpdate(
    { _id: id, user_id: userId },
    { level, goal, study_time: studyTime, steps },
    { returnDocument: 'after' }
  )
  return toPublicRoadmap(roadmap)
}

module.exports = {
  createRoadmap,
  listRoadmapsByUser,
  findRoadmapById,
  deleteRoadmap,
  updateRoadmap,
}
