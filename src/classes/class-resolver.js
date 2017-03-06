'use strict'

const path = require('path')

const TYPES = Object.freeze({
  adapter: 'adapters',
  serializer: 'serializers',
  mixin: 'mixins',
  store: 'stores',
  model: 'models',
  route: 'routes',
  initializer: 'initializers',
  middleware: 'middleware',
  service: 'services'
})

/**
  @class ClassResolver
  @private
*/
module.exports = class ClassResolver {
  /**
    Resolves a class via a number of lookups.
    1. Try the apps folder for the requested type using the specified name
    2. Try the apps folder for the requested type using the generic 'application.js' file
    3. Fallback to the framework's lib directory

    @example
    ```javascript
    ClassResolver.resolve('route', 'my-route.js')
    ```
    app/routes/my-route.js will be returned if it exists otherwise
    app/routes/application.js will be returned if it exists otherwise
    node_modules/ash-core/lib/route.js otherwise

    @method resolve
    @public
    @param {String} type
    @param {String} name
  */
  static resolve (type, name) {
    try {
      return require(path.join(process.cwd(), 'app', TYPES[type], name))
    } catch (e) {
      try {
        return require(path.join(process.cwd(), 'app', TYPES[type], 'application'))
      } catch (e) {
        return require(path.join(__dirname, type))
      }
    }
  }
}
