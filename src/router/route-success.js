const isReadableStream = require('./is-stream')

module.exports = function (model, status, response) {
  if (isReadableStream(model)) {
    response.status(status)
    model.pipe(response)
  } else if (typeof model === 'object') {
    response.status(status)
    return response.json(model)
  } else if (!model) {
    response.status(status)
    return response.send(String())
  } else {
    response.status(status)
    return response.send(String(model))
  }
}
