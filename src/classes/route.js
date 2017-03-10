'use strict'

const Http = require('./http')
const middleware = new WeakMap()
const { singularize } = require('inflection')
const HttpError = require('@ash-framework/http-error')

/**
  The Ash route class extends the See Http class and so has access
  to request and response properties.

  Routes execute via a series of hooks in the following order

  1. deserialize
  2. beforeModel
  3. model
  4. afterModel
  5. serialize

  If a hook returns a promise, the subsequent hook will not execute until the promise has resolved.

  All hooks are optional except for `model` and amything returned from the `model` hook will be returned
  to the client.

  Routes support the following:
  - mixins (See Mixin)
  - services (See Service)
  - middleware (See Middleware)

  @class Route
  @extends Http
  @public
*/
module.exports = class Route extends Http {
  /**
    @method constructor
    @public
    @constructor
  */
  constructor (context) {
    super(context)

    const mw = []
    this.constructor.middleware(middleware => mw.push(middleware))
    middleware.set(this, mw)
  }

  /**
    @method hasMiddleware
    @private
  */
  get hasMiddleware () {
    return middleware.get(this).length > 0
  }

  /**
    @method registeredMiddleware
    @private
  */
  get registeredMiddleware () {
    return middleware.get(this)
  }

  /**
    Route middleware

    You can use this to register route specific middleware. ie. middleware specified here
    will only run for this route. You can register the same piece of middleware in multiple
    routes but you must do so explicitly by registering it in that routes `middleware` method.

    Call `register` with the name of the middleware in the `app/middleware` directory that
    you want to load. You can call register multiple times to register more than one middleware
    and middleware will be executed in the order registered.

    Example: registering middleware on a route
    ```javascript

    // app/routes/my-route.js
    import Ash from 'ash-core'

    export default class MyRoute extends Ash.Route {
      static middleware (register) {
        register('my-middleware')
      }
    }
    ```

    @method middleware
    @static
    @public
    @param {Function} register
  */
  static middleware (register) {

  }

  /**
    The first hook to be executed during the lifecycle of a route.
    This hook should generally be used to perform operations on an incoming
    request body. As such it makes more sense to use this hook for POSTs, PUTs and PATCHs
    rather than GETs and DELETEs.

    @method {Function} deserialize
    @public
  */
  deserialize () {

  }

  /**
    @method beforeModel
    @public
  */
  beforeModel () {

  }

  /**
    @method model
    @public
  */
  model () {
    return Promise.reject(`Route '${this.constructor.name}' must implement model () {} hook.`)
  }

  /**
    @property modelName
    @public
    @return {String}
  */
  static get modelName () {
    // TODO: harden interface and test
    const routeName = this.name.toLowerCase()
    return singularize(routeName.replace('route', ''))
  }

  /**
    @method afterModel
    @public
    @param {Object} model
    @return {any}
  */
  afterModel (model) {
    return model
  }

  /**
    @method serialize
    @public
    @param {Object} model
  */
  serialize (model) {
    if (this.store && this.constructor.modelName) {
      const serializer = this.store.serializerFor(this.constructor.modelName)
      // TODO: set baseUrl from config or request
      // const options = {baseUrl: ''}
      const Model = this.store.modelFor(this.constructor.modelName)
      if (serializer && Model) {
        return serializer.serialize(Model, model)
      }
    }
    return model
  }

  /**
    @method error
    @public
    @param {Object} error
    @return {any} error
  */
  error (error) {
    return error
  }

  /**
    The name of the route. This is the same as the name of the route js file (without the .js)
    and not the name of the exported class. For the name of the class use `this.name`

    @property {String} routeName
    @public
  */
}
