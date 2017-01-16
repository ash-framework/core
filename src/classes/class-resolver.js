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

module.exports = class ClassResolver {
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
