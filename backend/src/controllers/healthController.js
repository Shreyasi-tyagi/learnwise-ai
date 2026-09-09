function getHealth(req, res) {
  res.json({
    status: 'ok',
    service: 'LearnWise AI backend',
    timestamp: new Date().toISOString(),
  })
}

module.exports = {
  getHealth,
}
