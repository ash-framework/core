'use strict'

const HttpContext = require('@ash-framework/http-context')
const ArgumentError = require('@ash-framework/argument-error')
const path = require('path')
const FileNotFoundError = require('@ash-framework/file-not-found-error')

function validateInput (name, options) {
  if (!name) {
    throw new ArgumentError('Middleware.map', 'this.middleware', `expected 'name' to be present`)
  }
  if (typeof name !== 'string' && typeof name !== 'function') {
    throw new ArgumentError('Middleware.map', 'this.middleware', `expected 'name' to be a string or middleware function, got ${typeof name}`)
  }
  if (options) {
    if (typeof options !== 'function' && typeof options !== 'object') {
      throw new ArgumentError('Middleware.map', 'this.middleware', `expected 'options|callback' to be an options object or a callback function, got ${typeof options}`)
    }
  }
}

module.exports = function (defnFunc, app, middlewareDir) {
  function processMiddlewareMap (defnFunc, relativePath = '/') {
    defnFunc.call({
      middleware (name, options = {}) {
        validateInput(name, options)

        if (typeof options === 'function') {
          processMiddlewareMap(options, path.join(relativePath, name))
        } else if (typeof name === 'function') {
          app.use(name)
        } else {
          let MW, mw, middlewarePath
          try {
            middlewarePath = path.join(middlewareDir, relativePath, name)
            const Module = require(middlewarePath)
            MW = (Module.__esModule) ? Module.default : Module
          } catch (e) {
            throw new FileNotFoundError(`${name}.js`, middlewarePath)
          }
          try {
            mw = new MW()
          } catch (e) {
            throw new Error(`Invalid middleware class definition in ${path.join(middlewarePath, name)}.js`)
          }
          if (!mw.register) {
            throw new Error(`Invalid middleware class definition, expected method 'register' but was not found in ${path.join(middlewarePath, name)}.js`)
          }
          app.use(function (req, res, next) {
            Promise.resolve()
              .then(() => mw.register(new HttpContext(req, res), options))
              .then(() => next())
              .catch(next)
          })
        }
      }
    })
  }

  processMiddlewareMap(defnFunc)
}
