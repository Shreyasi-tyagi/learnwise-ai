const asyncHandler = require('../middleware/asyncHandler')
const { validateRequired } = require('../utils/validate')
const roadmapModel = require('../models/roadmapModel')
const bookmarkModel = require('../models/bookmarkModel')
const progressModel = require('../models/progressModel')
const practiceModel = require('../models/practiceModel')
const aiService = require('../services/aiService')
const searchResources = asyncHandler(async (req, res) => {
  const query = String(req.query.q || '').trim()

  if (!query) {
    return res.status(400).json({
      status: 'error',
      message: 'Query parameter q is required',
    })
  }

  let userContext = null
  try {
    const roadmaps = await roadmapModel.listRoadmapsByUser(req.user.id)
    if (roadmaps && roadmaps.length > 0) {
      const activeRoadmap = roadmaps[0]
      const progress = await progressModel.listProgressByUser(req.user.id)
      
      const completedSteps = progress
        .filter(p => p.category === 'roadmap' && p.itemKey.startsWith(`${activeRoadmap.id}:`) && p.status === 'completed')
        .map(p => p.label)

      userContext = {
        level: activeRoadmap.level,
        goal: activeRoadmap.goal,
        studyTime: activeRoadmap.studyTime,
        completedSteps
      }
    }
  } catch (err) {
    console.error('Failed to fetch user context for resources:', err)
  }

  const results = await aiService.generateResourceRecommendations(query, userContext)

  res.json({
    status: 'ok',
    query,
    results,
  })
})



const createRoadmap = asyncHandler(async (req, res) => {
  const { valid, missing } = validateRequired(['level', 'goal', 'studyTime'], req.body)

  if (!valid) {
    return res.status(400).json({
      status: 'error',
      message: 'Missing required fields',
      missing,
    })
  }

  const level = req.body.level.trim()
  const goal = req.body.goal.trim()
  const studyTime = req.body.studyTime.trim()
  
  let steps = req.body.steps
  if (!steps || !Array.isArray(steps) || steps.length === 0) {
    steps = await aiService.generateRoadmapSteps(level, goal, studyTime)
  }

  const roadmap = await roadmapModel.createRoadmap({
    userId: req.user.id,
    level,
    goal,
    studyTime,
    steps,
  })

  res.status(201).json({
    status: 'ok',
    roadmap,
  })
})

const updateRoadmap = asyncHandler(async (req, res) => {
  const { valid, missing } = validateRequired(['level', 'goal', 'studyTime'], req.body)

  if (!valid || !Array.isArray(req.body.steps)) {
    return res.status(400).json({
      status: 'error',
      message: 'Missing required fields or invalid steps format',
      missing: valid ? ['steps'] : missing,
    })
  }

  const level = req.body.level.trim()
  const goal = req.body.goal.trim()
  const studyTime = req.body.studyTime.trim()
  const steps = req.body.steps

  const roadmap = await roadmapModel.updateRoadmap({
    id: req.params.id,
    userId: req.user.id,
    level,
    goal,
    studyTime,
    steps,
  })

  if (!roadmap) {
    return res.status(404).json({ status: 'error', message: 'Roadmap not found' })
  }

  res.json({
    status: 'ok',
    roadmap,
  })
})

const listRoadmaps = asyncHandler(async (req, res) => {
  const roadmaps = await roadmapModel.listRoadmapsByUser(req.user.id)

  res.json({
    status: 'ok',
    roadmaps,
  })
})

const getRoadmap = asyncHandler(async (req, res) => {
  const roadmap = await roadmapModel.findRoadmapById(req.params.id, req.user.id)

  if (!roadmap) {
    return res.status(404).json({ status: 'error', message: 'Roadmap not found' })
  }

  res.json({
    status: 'ok',
    roadmap,
  })
})

const deleteRoadmap = asyncHandler(async (req, res) => {
  const deleted = await roadmapModel.deleteRoadmap(req.params.id, req.user.id)

  if (!deleted) {
    return res.status(404).json({ status: 'error', message: 'Roadmap not found' })
  }

  res.json({
    status: 'ok',
    message: 'Roadmap deleted',
  })
})

const addBookmark = asyncHandler(async (req, res) => {
  const { valid, missing } = validateRequired(['title'], req.body)

  if (!valid) {
    return res.status(400).json({
      status: 'error',
      message: 'Missing required fields',
      missing,
    })
  }

  const bookmark = await bookmarkModel.addBookmark({
    userId: req.user.id,
    title: req.body.title.trim(),
    type: req.body.type,
    difficulty: req.body.difficulty,
    duration: req.body.duration,
    reason: req.body.reason,
    url: req.body.url,
    source: req.body.source,
  })

  res.status(201).json({
    status: 'ok',
    bookmark,
  })
})

const listBookmarks = asyncHandler(async (req, res) => {
  const bookmarks = await bookmarkModel.listBookmarksByUser(req.user.id)

  res.json({
    status: 'ok',
    bookmarks,
  })
})

const removeBookmark = asyncHandler(async (req, res) => {
  const removed = await bookmarkModel.removeBookmark(req.params.id, req.user.id)

  if (!removed) {
    return res.status(404).json({ status: 'error', message: 'Bookmark not found' })
  }

  res.json({
    status: 'ok',
    message: 'Bookmark removed',
  })
})

const updateProgress = asyncHandler(async (req, res) => {
  const { valid, missing } = validateRequired(['category', 'itemKey'], req.body)

  if (!valid) {
    return res.status(400).json({
      status: 'error',
      message: 'Missing required fields',
      missing,
    })
  }

  const progress = await progressModel.upsertProgress({
    userId: req.user.id,
    category: req.body.category.trim(),
    itemKey: req.body.itemKey.trim(),
    label: req.body.label,
    status: req.body.status,
  })

  res.status(201).json({
    status: 'ok',
    progress,
  })
})

const listProgress = asyncHandler(async (req, res) => {
  const progress = await progressModel.listProgressByUser(req.user.id)

  res.json({
    status: 'ok',
    progress,
  })
})

const progressSummary = asyncHandler(async (req, res) => {
  const summary = await progressModel.getProgressSummary(req.user.id)

  res.json({
    status: 'ok',
    summary,
  })
})

const generatePractice = asyncHandler(async (req, res) => {
  let userContext = null
  try {
    const roadmaps = await roadmapModel.listRoadmapsByUser(req.user.id)
    if (roadmaps && roadmaps.length > 0) {
      const activeRoadmap = roadmaps[0]
      const progress = await progressModel.listProgressByUser(req.user.id)
      
      const completedSteps = progress
        .filter(p => p.category === 'roadmap' && p.itemKey.startsWith(`${activeRoadmap.id}:`) && p.status === 'completed')
        .map(p => p.label)

      userContext = {
        level: activeRoadmap.level,
        goal: activeRoadmap.goal,
        studyTime: activeRoadmap.studyTime,
        completedSteps
      }
    }
  } catch (err) {
    console.error('Failed to fetch user context for practice:', err)
  }

  const rawQuestions = await aiService.generatePracticeQuestions(userContext)
  
  if (!rawQuestions || rawQuestions.length !== 5) {
    return res.status(500).json({ status: 'error', message: 'Failed to generate 5 practice questions.' })
  }

  const attempt = await practiceModel.createPracticeAttempt(req.user.id, rawQuestions)

  const sanitizedQuestions = attempt.questions.map(q => ({
    _id: q._id,
    question: q.question,
    options: q.options,
    topic: q.topic
  }))

  res.status(201).json({
    status: 'ok',
    practiceId: attempt._id,
    questions: sanitizedQuestions
  })
})

const submitPractice = asyncHandler(async (req, res) => {
  const { practiceId, answers } = req.body
  
  if (!practiceId || !Array.isArray(answers)) {
    return res.status(400).json({ status: 'error', message: 'Missing practiceId or answers' })
  }

  const attempt = await practiceModel.getPracticeAttempt(practiceId, req.user.id)
  
  if (!attempt) {
    return res.status(404).json({ status: 'error', message: 'Practice session not found' })
  }

  if (attempt.isSubmitted) {
    return res.status(400).json({ status: 'error', message: 'Practice session already submitted' })
  }

  let score = 0
  const results = attempt.questions.map((q, index) => {
    const userAnswer = answers[index]
    const isCorrect = userAnswer === q.correctAnswer
    if (isCorrect) score++
    
    return {
      _id: q._id,
      question: q.question,
      options: q.options,
      userAnswer,
      correctAnswer: q.correctAnswer,
      isCorrect,
      explanation: q.explanation,
      topic: q.topic
    }
  })

  const totalQuestions = attempt.questions.length
  const percentage = Math.round((score / totalQuestions) * 100)

  await practiceModel.submitPracticeAttempt(practiceId, req.user.id, answers, score, percentage)

  res.json({
    status: 'ok',
    score,
    totalQuestions,
    percentage,
    results
  })
})

const getLatestPractice = asyncHandler(async (req, res) => {
  const attempt = await practiceModel.getLatestPracticeAttempt(req.user.id)
  res.json({
    status: 'ok',
    practice: attempt ? {
      score: attempt.score,
      totalQuestions: attempt.totalQuestions,
      percentage: attempt.percentage,
      createdAt: attempt.created_at
    } : null
  })
})

const postMentorChat = asyncHandler(async (req, res) => {
  const message = String(req.body.message || '').trim()
  const history = Array.isArray(req.body.history) ? req.body.history : []

  if (!message) {
    return res.status(400).json({
      status: 'error',
      message: 'Message is required',
    })
  }

  let userContext = null
  try {
    const roadmaps = await roadmapModel.listRoadmapsByUser(req.user.id)
    let activeRoadmap = null
    let completedSteps = []
    let nextStep = null

    if (roadmaps && roadmaps.length > 0) {
      activeRoadmap = roadmaps[0]
      const progress = await progressModel.listProgressByUser(req.user.id)
      
      const completedSet = new Set(
        progress
          .filter(p => p.category === 'roadmap' && p.itemKey.startsWith(`${activeRoadmap.id}:`) && p.status === 'completed')
          .map(p => p.label)
      )

      completedSteps = Array.from(completedSet)

      if (activeRoadmap.steps && Array.isArray(activeRoadmap.steps)) {
        for (const step of activeRoadmap.steps) {
          const stepTitle = step.title || step
          if (!completedSet.has(stepTitle)) {
            nextStep = stepTitle
            break
          }
        }
      }
    }

    const latestPractice = await practiceModel.getLatestPracticeAttempt(req.user.id)

    if (activeRoadmap) {
      userContext = {
        level: activeRoadmap.level,
        goal: activeRoadmap.goal,
        studyTime: activeRoadmap.studyTime,
        completedSteps,
        nextStep: nextStep || 'All roadmap steps completed!',
        latestPractice: latestPractice ? {
          score: latestPractice.score,
          totalQuestions: latestPractice.totalQuestions,
          percentage: latestPractice.percentage
        } : null
      }
    }
  } catch (err) {
    console.error('Failed to aggregate user context for mentor:', err)
  }

  const responseText = await aiService.generateMentorResponse(message, history, userContext)

  res.json({
    status: 'ok',
    reply: responseText,
    context: userContext ? {
      goal: userContext.goal,
      level: userContext.level
    } : null
  })
})

module.exports = {
  searchResources,
  createRoadmap,
  updateRoadmap,
  listRoadmaps,
  getRoadmap,
  deleteRoadmap,
  addBookmark,
  listBookmarks,
  removeBookmark,
  updateProgress,
  listProgress,
  progressSummary,
  generatePractice,
  submitPractice,
  getLatestPractice,
  postMentorChat,
}
