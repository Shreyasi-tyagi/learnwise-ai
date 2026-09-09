const mongoose = require('mongoose')

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true },
  explanation: { type: String, required: true },
  topic: { type: String, required: true }
}, { _id: true })

const practiceSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  questions: [questionSchema],
  submittedAnswers: [{ type: Number }],
  score: { type: Number, default: 0 },
  totalQuestions: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  isSubmitted: { type: Boolean, default: false }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})

const Practice = mongoose.model('Practice', practiceSchema)

async function createPracticeAttempt(userId, questions) {
  const attempt = new Practice({
    user_id: userId,
    questions,
    totalQuestions: questions.length
  })
  await attempt.save()
  return attempt
}

async function getPracticeAttempt(id, userId) {
  return await Practice.findOne({ _id: id, user_id: userId })
}

async function getLatestPracticeAttempt(userId) {
  return await Practice.findOne({ user_id: userId, isSubmitted: true }).sort({ created_at: -1 })
}

async function submitPracticeAttempt(id, userId, submittedAnswers, score, percentage) {
  return await Practice.findOneAndUpdate(
    { _id: id, user_id: userId, isSubmitted: false },
    {
      submittedAnswers,
      score,
      percentage,
      isSubmitted: true
    },
    { returnDocument: 'after' }
  )
}

module.exports = {
  createPracticeAttempt,
  getPracticeAttempt,
  getLatestPracticeAttempt,
  submitPracticeAttempt
}
