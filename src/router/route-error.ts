import { STATUS_CODES } from 'http'

const { NODE_ENV } = process.env

export default function (error, httpContext) {
  const { response } = httpContext
  const status = error.status || 500
  const body = {
    stack: null,
    message: error.message || STATUS_CODES[error.status || 500]
  }
  if (error.stack && NODE_ENV !== 'production') {
    body.stack = error.stack
  }
  response.status(status).json(body)
}
