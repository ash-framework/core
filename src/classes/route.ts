import Http from './http'
import Middleware from './middleware'
import { singularize } from 'inflection'
import { Request, Response } from 'express'

const middleware = new WeakMap()

export interface Hooks {
  deserialize(): Promise<any> | void
  beforeModel(): Promise<any> | void
  model(): any
  afterModel(model: any): any
  serialize(model: any): any
  error<T extends Error>(error: T): any
}

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
export default class Route extends Http implements Hooks {
  static classType: string = 'route'
  static middleware: Array<string> = []

  /**
    @method constructor
    @public
    @constructor
  */
  constructor(options: { request: Request, response: Response }) {
    super(options)
  }

  /**
    @property modelName
    @public
    @return {String}
  */
  static modelName: string

  /**
    The name of the route. This is the same as the name of the route js file (without the .js)
    and not the name of the exported class. For the name of the class use `this.name`

    @property {String} routeName
    @public
  */
  static routeName: string

  /**
    @method hasMiddleware
    @private
  */
  static get hasMiddleware(): boolean {
    return this.middleware.length > 0
  }

  /**
    The first hook to be executed during the lifecycle of a route.
    This hook should generally be used to perform operations on an incoming
    request body. As such it makes more sense to use this hook for POSTs, PUTs and PATCHs
    rather than GETs and DELETEs.

    @method {Function} deserialize
    @public
  */
  deserialize(): any {

  }

  /**
    @method beforeModel
    @public
  */
  beforeModel(): any {

  }

  /**
    @method model
    @public
  */
  model(): any {
    const msg = `Route '${this.constructor.name}': model hook error. You must implement a model hook`
    return Promise.reject(msg)
  }

  /**
    @method afterModel
    @public
    @param {Mixed} model
    @return {any}
  */
  afterModel(model): any {
    return model
  }

  /**
    @method serialize
    @public
    @param {Mixed} model
  */
  serialize(model): any {
    return model
  }

  /**
    @method error
    @public
    @param {Error} error
    @return {any} error
  */
  error<T extends Error>(error: T): any {
    return Promise.reject(error)
  }
}
