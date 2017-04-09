import { camelCase, isPlainObject, get } from 'lodash'
import * as assert from 'assert'
import { existsSync } from 'fs'
import * as path from 'path'
import { Registry, Container } from '@glimmer/di'

// function setupModel (Model) {
//   Model.definition = {attributes: {}, relationships: {}}

//   // Process attributes
//   if (Model.attributes) {
//     Model.attributes(function (name, type, options = {}) {
//       if (options.defaultValue) {
//         if (typeof options.defaultValue !== type && typeof options.defaultValue !== 'function') {
//           throw new Error(`Invalid value given for 'defaultValue' Expected ${type} or function, got ${typeof options.defaultValue}`)
//         }
//       }

//       // create attributes metadata object
//       options.type = type
//       Model.definition.attributes[name] = options

//       // define properties with getters/setters for each attribute
//       Reflect.defineProperty(Model.prototype, name, {
//         get () {
//           const type = get(this, `constructor.definition.attributes.${name}.type`)
//           if (type === 'date') {
//             return new Date(this.attributes[name])
//           }
//           return this.attributes[name]
//         },
//         set (value) {
//           const attributes = this.attributes
//           attributes[name] = value
//           this.attributes = attributes
//         },
//         enumerable: true,
//         configurable: false
//       })
//     })
//   }

//   // Process idField (primary key)
//   Reflect.defineProperty(Model.prototype, Model.idField, {
//     get () {
//       return this.attributes[Model.idField]
//     },
//     set (value) {
//       const attributes = this.attributes
//       attributes[Model.idField] = value
//       this.attributes = attributes
//     },
//     enumerable: true,
//     configurable: false
//   })

//   // If primary key not explicitly defined using `attr()` function, define as a number
//   if (!Model.definition.attributes[Model.idField]) {
//     Model.definition.attributes[Model.idField] = {type: 'number'}
//   }

//   // Process relationships
//   if (Model.attributes && Model.relationships) {
//     Model.relationships(function (type, modelName, options = {}) {
//       const store = Model.store
//       const RelatedModel = store.modelFor(modelName)

//       // default name to singular or plural depending on type. Allow user override via options.name
//       let name = (type === 'hasMany') ? camelCase(RelatedModel.type) : camelCase(modelName)
//       if (options.name) name = options.name

//       // default keyFrom to singular or plural depending on type. Allow user override via options.keyFrom
//       let keyFrom = (type === 'hasMany') ? camelCase(Model.idField) : `${camelCase(RelatedModel.modelName)}Id`
//       if (options.keyFrom) keyFrom = options.keyFrom

//       // default keyTo to singular or plural depending on type. Allow user override via options.keyTo
//       let keyTo = (type === 'hasMany') ? `${camelCase(Model.modelName)}Id` : camelCase(RelatedModel.idField)
//       if (options.keyTo) keyTo = options.keyTo

//       // create relationships definition object. This is used both for fetching related data and for
//       // serialization
//       const defn = {type, modelFrom: Model.modelName, modelTo: modelName, keyFrom, keyTo}
//       Model.definition.relationships[name] = defn

//       if (type === 'belongsTo') {
//         // define keyFrom (eg. postId) if not explicitly defined using `attr()` function
//         if (!Model.definition.attributes[defn.keyFrom]) {
//           Model.definition.attributes[defn.keyFrom] = {type: 'number'}
//         }
//       }

//       if (type === 'hasMany') {
//         if (!RelatedModel.definition.attributes[defn.keyTo]) {
//           RelatedModel.definition.attributes[defn.keyTo] = {type: 'number'}
//         }
//       }

//       // define properties with getters/setters for each attribute
//       Reflect.defineProperty(Model.prototype, name, {
//         get () {
//           const adapter = Model.adapter

//           // if the data has been passed in during object construction
//           // use that to build model instances and return them wrapped in a promise rather
//           // than hitting the adapter
//           if (this.attributes[name]) {
//             let models
//             if (type === 'hasMany' && Array.isArray(this.attributes[name])) {
//               models = this.attributes[name].map(data => new RelatedModel(data))
//             } else {
//               models = new RelatedModel(this.attributes[name])
//             }
//             return Promise.resolve(models)
//           }

//           // otherwise use the adapter to fetch the data, construct models and return as a promise
//           if (type === 'hasMany') {
//             if (!this.attributes[defn.keyFrom]) return Promise.resolve([])
//             return adapter.query(modelName, {filter: {[defn.keyTo]: this.attributes[defn.keyFrom]}})
//               .then(data => {
//                 // cache the data in the models attributes hash so that next time related data is accessed
//                 // no hit on the adapter is needed.
//                 const attributes = this.attributes
//                 attributes[name] = data
//                 this.attributes = attributes
//                 return data.map(record => new RelatedModel(record))
//               })
//           } else if (type === 'belongsTo') {
//             if (!this.attributes[defn.keyFrom]) return Promise.resolve(null)
//             return adapter.queryRecord(modelName, {filter: {[defn.keyTo]: this.attributes[defn.keyFrom]}})
//               .then(data => {
//                 if (data === null) return null

//                 // cache the data in the models attributes hash so that next time related data is accessed
//                 // no hit on the adapter is needed.
//                 const attributes = this.attributes
//                 attributes[name] = data
//                 this.attributes = attributes
//                 return new RelatedModel(data)
//               })
//           }
//         },
//         set (value) {
//           // Do some basic validation of the value being set
//           if (type === 'hasMany' && !Array.isArray(value)) {
//             throw new Error(`Array expected when setting ${name} on ${Model.modelName} model. Instead got ${typeof value}`)
//           } else if (type === 'belongsTo' && !isPlainObject(value) && !(value instanceof RelatedModel)) {
//             throw new Error(`Object or ${RelatedModel.modelName} expected when setting ${name} on ${Model.modelName} model. Instead got ${typeof value}`)
//           }

//           // this.attributes is always a pojo but we want to support setting models so perform a stringify/parse
//           // before setting
//           const attributes = this.attributes
//           attributes[name] = JSON.parse(JSON.stringify(value))
//           this.attributes = attributes
//         },
//         enumerable: false,
//         configurable: false
//       })
//     })
//   }
// }

class Resolver {
  identify: any

  retrieve(specifier: string) {
    let [type, name, verb] = specifier.split(':')

    if (type === 'route') {
      if (verb === 'get') {
        const file = path.join(process.cwd(), 'app', `routes`, `${name}.ts`)
        if (existsSync(file)) {
          return require(file).default
        }
      }
      const file = path.join(process.cwd(), 'app', `routes`, `${name}.${verb}.ts`)
      if (existsSync(file)) {
        return require(file).default
      }
    }

    if (type === 'router') {
      if (name === 'main') {
        return require(path.join(process.cwd(), 'app', `router`)).default
      }
    }

    if (type === 'middleware') {
      return require(path.join(process.cwd(), 'app', 'middleware', name)).default
    }

    if (type === 'initializer') {
      return require(path.join(process.cwd(), 'app', 'initializers', name)).default
    }

    if (type === 'service') {
      return require(path.join(process.cwd(), 'app', 'services', name)).default
    }

    // const Model = require(path.join(process.cwd(), 'app', `${type}s`, `${name}.js`))
    // setupModel(Model)
    // return Model
  }
}

const registry = new Registry()
const resolver = new Resolver()
const container = new Container(registry, resolver)

registry.registerOption('service', 'singleton', true)
registry.registerOption('mixin', 'singleton', false)
registry.registerOption('route', 'singleton', false)
registry.registerOption('middleware', 'singleton', false)
registry.registerOption('router', 'singleton', true)
// registry.registerOption('model', 'singleton', false)
// registry.registerOption('store', 'singleton', true)
// registry.registerOption('adapter', 'singleton', true)
// registry.registerOption('serializer', 'singleton', true)
// registry.registerOption('middleware-router', 'singleton', true)
// registry.registerOption('initializer', 'singleton', true)
// registry.registerOption('application', 'singleton', true)

// define D.I. rules
// registry.registerInjection('model', 'store', 'store:main')
// registry.registerInjection('route', 'store', 'store:main')

export { registry, container }
