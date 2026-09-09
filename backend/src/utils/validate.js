function validateRequired(fields, body) {
  const missing = fields.filter((field) => {
    const value = body[field]
    return typeof value !== 'string' || value.trim().length === 0
  })

  return {
    valid: missing.length === 0,
    missing,
  }
}

module.exports = {
  validateRequired,
}
