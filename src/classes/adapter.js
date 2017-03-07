const Base = require('./base')
const Knex = require('knex')
const {get} = require('lodash')
const QueryObjectTranslator = require('./query-object-translator')

/**
  @class Adapter
  @extends Base
  @public
*/
module.exports = class Adapter extends Base {
  /**
    Sets up the knex query builder instance
    @method constructor
    @constructor
    @public
    @param {Store} store - Instance of Ash.Store
    @param {Mixed} options - knex database options {Object} or {String}
  */
  constructor (store, options) {
    super()
    this.store = store
    this.knex = Knex({
      client: 'pg',
      connection: options,
      searchPath: 'knex,public'
    })
  }

  /**
    Returns a fields array of Model attribute names
    @method fieldsForModel
    @private
    @param {Model} Model - Model class
    @return {Array} - array of model attribute names
  */
  fieldsForModel (Model) {
    return Object.keys(get(Model, 'definition.attributes'), {})
  }

  /**
    @method include
    @private
    @param {Model} Model
    @param {Object} query
    @param {String} includeString
    @param {Object} fieldOptions
    @return {Promise}
  */
  include (Model, query, includeString = '', fieldOptions) {
    return query.then(data => {
      data = JSON.parse(JSON.stringify(data))
      if (!Array.isArray(data)) data = [data]
      return Promise.all(includeString.split(',').map(include => {
        include = include.trim()
        if (include.indexOf('.') !== -1) return
        const definition = get(Model, `definition.relationships.${include}`)
        if (!definition) return
        const RelatedModel = this.store.modelFor(definition.modelTo)
        if (!RelatedModel) return
        let query = this.knex(RelatedModel.tableName)

        let attributes = this.fieldsForModel(RelatedModel)
        if (fieldOptions) attributes = this.limitFieldSet(RelatedModel, attributes, fieldOptions)
        query = query.column(attributes)

        let ids = data.map(item => item[definition.keyFrom])
        query = query.whereIn(definition.keyTo, ids)

        return query.then(relatedData => {
          const relatedDataGroups = new Map()
          relatedData.forEach(relData => {
            if (relatedDataGroups.has(relData[definition.keyTo])) {
              relatedDataGroups.get(relData[definition.keyTo]).push(relData)
            } else {
              relatedDataGroups.set(relData[definition.keyTo], [relData])
            }
          })
          return {name: include, definition, groupedData: relatedDataGroups}
        })
      }))
      .then(relationshipData => {
        data.forEach(item => {
          relationshipData.forEach(relationship => {
            const relData = relationship.groupedData.get(item[relationship.definition.keyFrom])
            if (relationship.definition.type === 'belongsTo') {
              item[relationship.name] = relData[0]
            } else {
              item[relationship.name] = relData
            }
          })
        })
        return JSON.parse(JSON.stringify(data))
      })
    })
  }

  /**
    @method limitFieldSet
    @private
    @param {Model} Model
    @param {Object} attributes
    @param {Object} options
    @return {Array} attributes
  */
  limitFieldSet (Model, attributes = [], options = {}) {
    const originalAttributes = attributes
    const types = Object.keys(options)
    if (types.indexOf(Model.type) !== -1) {
      const fields = options[Model.type].split(',').map(field => field.trim())
      attributes = []
      for (const attr of originalAttributes) {
        if (fields.indexOf(attr) !== -1) {
          attributes.push(attr)
        }
      }
    }
    return attributes
  }

  /**
    @method paginate
    @private
    @param {Promise} query - knex query promise object
    @param {Object} options
    @return {Promise} - knex query promise object
  */
  paginate (query, options = {}) {
    const number = options.number || 0
    const size = options.size || 20
    return query.limit(size).offset(number * size - size)
  }

  /**
    @method sort
    @private
    @param {Promise} query - knex query promise object
    @param {String} sortString
    @return {Promise} - knex query promise object
  */
  sort (query, sortString = '') {
    sortString.split(',').forEach(column => {
      const direction = (column.indexOf('-') !== -1) ? 'DESC' : 'ASC'
      column = column.replace('-', '')
      query = query.orderBy(column.trim(), direction)
    })
    return query
  }

  /**
    Finds all records for a given model. Use `query` when you need more control over
    what records are returned.
    @method findAll
    @public
    @param {Model} Model
    @return {Promise}
  */
  findAll (Model) {
    const attributes = this.fieldsForModel(Model)
    const tableName = Model.tableName
    return this.knex.column(attributes).select().from(tableName)
  }

  /**
    Finds records of a given model using options.

    Options is an {Object} with the following properties:

    `include` - used to include related model records

    ```javascript
    adapter.query(Post, {include: 'comments,author'})
    ```

    `fields` - used to specify desired attribute fields to be returned in result objects

    ```javascript
    adapter.query(Post, {fields: {posts: 'title,description'}})
    ```

    To restrict fields from included relationship models

    ```javascript
    adapter.query(Post, {fields: {posts: 'title', comments: 'comment'}})
    ```

    `sort` - used to sort results by its attributes

    ```javascript
    adapter.query(Post, {sort: 'title'})
    ```

    To specify sorting by multiple columns, separate by comma

    ```javascript
    adapter.query(Post, {sort: 'title,description'})
    ```

    Sort is ascending by default, use "-" to indicate descending

    ```javascript
    adapter.query(Post, {sort: '-title'})
    ```

    `page` - used to paginate results

    ```javascript
    adapter.query(Post, {page: {number: 1, size: 20}})
    ```

    `filter` - used to refine desired results by specified criteria

    ```javascript
    adapter.query(Post, {filter: {title: 'my title'}})
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
    adapter.query(Post, {filter: {title: {$like: '%my title%'}}})
    ```

    `$or` is a slightly special case. It takes an array of objects to 'Or' together

    ```javascript
    adapter.query(Post, {filter: {
      $or: [
        {id: {$lt: 10}},
        {id: {$in: [20, 21, 22]}}
      ]
    })
    ```

    @method query
    @public
    @param {Model} Model
    @param {Object} options
    @return {Promise}
  */
  query (Model, options, single = false) {
    let query
    if (options.filter) {
      const translator = new QueryObjectTranslator(Model)
      query = translator.translate(options.filter)
    } else {
      query = this.knex.select().from(Model.tableName)
    }

    let attributes = this.fieldsForModel(Model)
    if (options.fields) attributes = this.limitFieldSet(Model, attributes, options.fields)
    query = query.column(attributes)

    if (options.page) query = this.paginate(query, options.page)
    if (options.sort) query = this.sort(query, options.sort)

    if (single) query = query.first()

    if (options.include) query = this.include(Model, query, options.include, options.fields)

    return query
  }

  /**
    Retrieves a single record for the given model by given id
    @method findRecord
    @public
    @param {Model} Model
    @param {number} id
    @return {Promise}
  */
  findRecord (Model, id, options = {}) {
    options.filter = {[Model.idField]: id}
    options.page = null
    options.sort = null
    return this.queryRecord(Model, options).then(result => result || null)
  }

  /**
    Similar to `query` except that only a single record is returned
    @method queryRecord
    @public
    @param {Model} Model
    @param {Object} options @see `query`
    @return {Promise}
  */
  queryRecord (Model, options) {
    return this.query(Model, options, true)
  }

  /**
    Creates a new record for a given model using supplied attributes hash
    @method createRecord
    @public
    @param {Model} Model
    @param {Object} data
    @return {Promise}
  */
  createRecord (Model, data) {
    const tableName = Model.tableName
    return this.knex(tableName).insert(data, '*')
      .then(results => results[0])
  }

  /**
    Updates a record for a given model with given id using a supplied attributes hash
    @method updateRecord
    @public
    @param {Model} Model
    @param {Number} id
    @param {Object} data
    @return {Promise}
  */
  updateRecord (Model, id, data) {
    const tableName = Model.tableName
    return this.knex(tableName).update(data, '*').where('id', id)
      .then(results => {
        if (results.length === 0) {
          return Promise.reject(new Error('Record not found'))
        }
        return results[0]
      })
  }

  /**
    Delete a Model by given id
    @method deleteRecord
    @public
    @param {Model} Model
    @param {Number} id
    @return {Promise}
  */
  deleteRecord (Model, id) {
    const tableName = Model.tableName
    return this.knex(tableName).where('id', id).delete()
      .then(numAffected => {
        if (numAffected === 0) {
          return Promise.reject(new Error('Record not found'))
        }
      })
  }
}
