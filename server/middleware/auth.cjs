const jwt = require('jsonwebtoken')

const JWT_SECRET =
  process.env.JWT_SECRET || 'qrtrace-local-development-secret'

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized'
    })
  }

  const token = authHeader.substring(7)

  try {
    const decoded = jwt.verify(token, JWT_SECRET)

    req.user = decoded

    next()
  } catch {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    })
  }
}

module.exports = {
  requireAuth,
  JWT_SECRET
}
