const { upsertProgress, listProgressByUser, getProgressSummary } = require('../models/progressModel')

async function updateProgress(req, res, next) {
  try {
    const { category, itemKey, label, status } = req.body
    
    if (!category || !itemKey) {
      return res.status(400).json({ status: 'error', message: 'category and itemKey are required' })
    }

    const progress = await upsertProgress({
      userId: req.user.id,
      category,
      itemKey,
      label,
      status
    })

    return res.status(200).json({ status: 'success', data: progress })
  } catch (error) {
    next(error)
  }
}

async function getProgressList(req, res, next) {
  try {
    const progressList = await listProgressByUser(req.user.id)
    return res.status(200).json({ status: 'success', data: progressList })
  } catch (error) {
    next(error)
  }
}

async function getSummary(req, res, next) {
  try {
    const summary = await getProgressSummary(req.user.id)
    return res.status(200).json({ status: 'success', data: summary })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  updateProgress,
  getProgressList,
  getSummary
}
