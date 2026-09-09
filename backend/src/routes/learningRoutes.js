const router = require('express').Router()
const {
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
} = require('../controllers/learningController')
const { requireAuth } = require('../middleware/authMiddleware')

router.get('/search', requireAuth, searchResources)

router.post('/practice/generate', requireAuth, generatePractice)
router.post('/practice/submit', requireAuth, submitPractice)
router.get('/practice/latest', requireAuth, getLatestPractice)

router.post('/mentor', requireAuth, postMentorChat)

router.post('/roadmap', requireAuth, createRoadmap)
router.get('/roadmap', requireAuth, listRoadmaps)
router.get('/roadmap/:id', requireAuth, getRoadmap)
router.put('/roadmap/:id', requireAuth, updateRoadmap)
router.delete('/roadmap/:id', requireAuth, deleteRoadmap)

router.get('/bookmarks', requireAuth, listBookmarks)
router.post('/bookmarks', requireAuth, addBookmark)
router.delete('/bookmarks/:id', requireAuth, removeBookmark)

router.get('/progress', requireAuth, listProgress)
router.get('/progress/summary', requireAuth, progressSummary)
router.post('/progress', requireAuth, updateProgress)

module.exports = router
