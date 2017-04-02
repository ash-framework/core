import { isReadableStream } from './utils'
import { Response } from 'express'

export default function (model: any, status: number, response: Response): void {
  if (isReadableStream(model)) {
    response.status(status)
    model.pipe(response)
  } else if (typeof model === 'object') {
    response.status(status)
    response.json(model)
  } else if (!model) {
    response.status(status)
    response.send(String())
  } else {
    response.status(status)
    response.send(String(model))
  }
}
