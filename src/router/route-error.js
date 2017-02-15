const {STATUS_CODES} = require('http')
const {NODE_ENV} = process.env

module.exports = function (error, httpContext) {
  const {response} = httpContext
  const status = error.status || 500
  const body = {
    message: error.message || STATUS_CODES[error.status || 500]
  }
  if (error.stack && NODE_ENV !== 'production') {
    body.stack = error.stack
  }
  response.status(status).json(body)
}
