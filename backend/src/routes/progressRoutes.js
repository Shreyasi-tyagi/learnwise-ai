const express = require('express')
const { requireAuth } = require('../middleware/authMiddleware')
const { updateProgress, getProgressList, getSummary } = require('../controllers/progressController')

const router = express.Router()

router.use(requireAuth)

router.get('/', getProgressList)
router.post('/', updateProgress)
router.get('/summary', getSummary)

module.exports = router
