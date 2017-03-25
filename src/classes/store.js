'use strict'

const Service = require('./service')
const Registry = require('./registry')
const ClassResolver = require('./class-resolver')
const path = require('path')
const assert = require('assert')
const {isPlainObject, isString} = require('lodash')

const adapters = new Map()
const serializers = new Map()

/**
  @class Store
  @extends Service
  @public
*/
module.exports = class Store extends Service {
  /**
   @method constructor
   @constructor
   @public
  */
  constructor (...args) {
    super(...args)
    this.config = require(path.join(process.cwd(), 'config', 'environment'))(process.env)
  }

  /**
    @method adapterFor
    @public
    @param {String} modelName
    @return {Adapter}
  */
  adapterFor (modelName) {
    assert(isString(modelName), 'First argument to store.adapterFor must be a string')
    if (!adapters.has(modelName)) {
      const Adapter = ClassResolver.resolve('adapter', modelName)
      adapters.set(modelName, new Adapter(this, this.config.database.connection))
    }
    return adapters.get(modelName)
  }

  /**
    @method serializerFor
    @public
    @param {String} modelName
    @return {Serializer}
  */
  serializerFor (modelName) {
    assert(isString(modelName), 'First argument to store.serializerFor must be a string')
    if (!serializers.has(modelName)) {
      const Serializer = ClassResolver.resolve('serializer', modelName)
      serializers.set(modelName, new Serializer())
    }
    return serializers.get(modelName)
  }

  /**
    @method modelFor
    @public
    @param {String} modelName
    @return {Model}
  */
  modelFor (modelName) {
    assert(isString(modelName), 'First argument to store.modelFor must be a string')
    assert(
      Registry.models.has(modelName),
      `Unable to find model "${modelName}" in registry. Registered models are ${Array.from(Registry.models.keys())}`
    )
    return Registry.models.get(modelName)
  }

  /**
    Finds all records for a given model. Use `query` when you need more control over
    what records are returned.
    @method findAll
    @public
    @param {String} modelName
    @return {Promise[Array]}
  */
  findAll (modelName) {
    assert(isString(modelName), 'First argument to store.findAll must be a string')
    const Model = this.modelFor(modelName)
    const adapter = this.adapterFor(modelName)
    return adapter.findAll(Model)
  }

  /**
    Finds records of a given model using options.

    Options is an {Object} with the following properties:

    `include` - used to include related model records

    ```javascript
    store.query(Post, {include: 'comments,author'})
    ```

    `fields` - used to specify desired attribute fields to be returned in result objects

    ```javascript
    store.query(Post, {fields: {posts: 'title,description'}})
    ```

    To restrict fields from included relationship models

    ```javascript
    store.query(Post, {fields: {posts: 'title', comments: 'comment'}})
    ```

    `sort` - used to sort results by its attributes

    ```javascript
    store.query(Post, {sort: 'title'})
    ```

    To specify sorting by multiple columns, separate by comma

    ```javascript
    store.query(Post, {sort: 'title,description'})
    ```

    Sort is ascending by default, use "-" to indicate descending

    ```javascript
    store.query(Post, {sort: '-title'})
    ```

    `page` - used to paginate results

    ```javascript
    store.query(Post, {page: {number: 1, size: 20}})
    ```

    `filter` - used to refine desired results by specified criteria

    ```javascript
    store.query(Post, {filter: {title: 'my title'}})
    ```

    filter also supports a number of operators prefixed with a $ character

    - `$or` - SQL OR
    - `$eq` - SQL =
    - `$gt` - SQL >
    - `$gte` - SQL >=
    - `$lt` - SQL <
    - `$lte` - SQL <=
    - `$ne` - SQL !=
    - `$not` - SQL NOT
    - `$between` - SQL BETWEEN
    - `$notbetween` - SQL NOT BETWEEN
    - `$in` - SQL IN
    - `$notin` SQL NOT IN
    - `$like` SQL LIKE
    - `$notlike` SQL NOT LIKE
    - `$ilike` - SQL NOT ILIKE
    - `$overlap` - SQL &&
    - `$contains` - SQL @>
    - `$contained` - SQL <@

    ```javascript
    store.query(Post, {filter: {title: {$like: '%my title%'}}})
    ```

    `$or` is a slightly special case. It takes an array of objects to 'Or' together

    ```javascript
    store.query(Post, {filter: {
      $or: [
        {id: {$lt: 10}},
        {id: {$in: [20, 21, 22]}}
      ]
    })
    ```

    @method query
    @public
    @param {String} modelName
    @param {Object} options
    @return {Promise[Array]}
  */
  query (modelName, options) {
    assert(isString(modelName), 'First argument to store.query must be a string')
    assert(!options || isPlainObject(options), 'Second (optional) argument, "options" to "store.query" must be an object when given')
    const Model = this.modelFor(modelName)
    const adapter = this.adapterFor(modelName)
    return adapter.query(Model, options)
  }

  /**
    Retrieves a single record for the given model by given id
    @method findRecord
    @public
    @param {String} modelName
    @param {number} id
    @return {Promise}
  */
  findRecord (modelName, id, options) {
    assert(isString(modelName), 'First argument to store.findRecord must be a string')
    assert(isFinite(id), 'Second argument to store.findRecord "id" must be a number or numeric string')
    assert(!options || isPlainObject(options), 'Third (optional) argument, "options" to "store.findRecord" must be an object when given')
    const Model = this.modelFor(modelName)
    const adapter = this.adapterFor(modelName)
    return adapter.findRecord(Model, parseInt(id, 10), options)
  }

  /**
    Similar to `query` except that only a single record is returned
    @method queryRecord
    @public
    @param {String} modelName
    @param {Object} options See `query`
    @return {Promise}
  */
  queryRecord (modelName, options) {
    assert(isString(modelName), 'First argument to store.queryRecord must be a string')
    assert(!options || isPlainObject(options), 'Second (optional) argument, "options" to "store.queryRecord" must be an object when given')
    const Model = this.modelFor(modelName)
    const adapter = this.adapterFor(modelName)
    return adapter.queryRecord(Model, options)
  }

  /**
    Creates a new record for a given model using supplied attributes hash
    @method createRecord
    @public
    @param {String} modelName
    @param {Object} data
    @return {Promise}
  */
  createRecord (modelName, data) {
    assert(isString(modelName), 'First argument to store.createRecord must be a string')
    assert(isPlainObject(data), 'Second argument, "data" to "store.createRecord" must be an object')
    const Model = this.modelFor(modelName)
    const adapter = this.adapterFor(modelName)
    return adapter.createRecord(Model, data)
  }

  /**
    Updates a record for a given model with given id using a supplied attributes hash
    @method updateRecord
    @public
    @param {String} modelName
    @param {Number} id
    @param {Object} data
    @return {Promise}
  */
  updateRecord (modelName, id, data) {
    assert(isString(modelName), 'First argument to store.updateRecord must be a string')
    assert(isFinite(id), 'Second argument to store.updateRecord "id" must be a number or numeric string')
    assert(isPlainObject(data), 'Third argument, "data" to "store.updateRecord" must be an object')
    const Model = this.modelFor(modelName)
    const adapter = this.adapterFor(modelName)
    return adapter.updateRecord(Model, parseInt(id, 10), data)
  }

  /**
    Delete a Model by given id
    @method deleteRecord
    @public
    @param {String} modelName
    @param {Number} id
    @return {Promise}
  */
  deleteRecord (modelName, id) {
    assert(isString(modelName), 'First argument to store.deleteRecord must be a string')
    assert(isFinite(id), 'Second argument to store.deleteRecord "id" must be a number or numeric string')
    const Model = this.modelFor(modelName)
    const adapter = this.adapterFor(modelName)
    return adapter.deleteRecord(Model, parseInt(id, 10))
  }
}
