'use strict'

const Http = require('./http')

const middleware = new WeakMap()

module.exports = class Route extends Http {
  constructor (...args) {
    super(...args)

    const mw = []
    this.middleware(middleware => mw.push(middleware))
    middleware.set(this, mw)
  }

  get hasMiddleware () {
    return middleware.get(this).length > 0
  }

  get registeredMiddleware () {
    return middleware.get(this)
  }

  middleware () {

  }

  deserialize () {

  }

  beforeModel () {

  }

  model () {
    console.log(`Route '${this.name}' must define a 'model' method`)
  }

  afterModel (model) {

  }

  serialize (model) {

  }

  error (err) {
    return err
  }
}
