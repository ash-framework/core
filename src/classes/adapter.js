const Base = require('./base')
const Knex = require('knex')
const {get} = require('lodash')

module.exports = class Adapter extends Base {
  /**
   * Sets up the knex query builder instance
   * @constructor
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

  fieldsForModel (Model) {
    return Object.keys(get(Model, 'definition.attributes'), {})
  }

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

  limitFieldSet (Model, attributes, options = {}) {
    const types = Object.keys(options)
    if (types.indexOf(Model.type) !== -1) {
      const fields = options[Model.type].split(',').map(field => field.trim())
      for (const attr of attributes) {
        if (fields.indexOf(attr) === -1) {
          attributes.splice(attributes.indexOf(attr))
        }
      }
    }
    return attributes
  }

  paginate (query, options = {}) {
    const number = options.size || 0
    const size = options.size || 20
    return query.limit(size).offset(number * size - size)
  }

  sort (query, sortString = '') {
    sortString.split(',').forEach(column => {
      const direction = (column.indexOf('-') !== -1) ? 'DESC' : 'ASC'
      column = column.replace('-', '')
      query = query.orderBy(column.trim(), direction)
    })
    return query
  }

  /**
   * Finds all records for a given model. @see `query` when you need more control over
   * what records are returned.
   *
   * @param {Object} Model - object with properties `tableName` and an `attributes` hash
   * @return {Array} - array of database records
   */
  findAll (Model) {
    const attributes = this.fieldsForModel(Model)
    const tableName = Model.tableName
    return this.knex.column(attributes).select().from(tableName)
  }

  /*
  options should be implemented here to jsonapi spec
  {
    include: 'comments, posts, comments.author',
    fields: {
      articles: 'title, body',
      people: 'name'
    },
    sort: 'age, -name',
    page: {number: 1, size: 20},
    filter: {}
  }
  */
  query (Model, options) {
    let query = this.knex.select().from(Model.tableName)
    let attributes = this.fieldsForModel(Model)
    if (options.fields) attributes = this.limitFieldSet(Model, attributes, options.fields)
    query = query.column(attributes)
    if (options.page) query = this.paginate(query, options.page)
    if (options.sort) query = this.sort(query, options.sort)
    if (options.include) query = this.include(Model, query, options.include, options.fields)
    return query
  }

  /**
   * Retrieves a single record for the given model by given id
   *
   * @param {Object} Model - object with properties `tableName` and an `attributes` hash
   * @param {number} id - id of record to retrieve
   * @return {Object} - a single record or null if no record was found
   */
  findRecord (Model, id) {
    const attributes = this.fieldsForModel(Model)
    const tableName = Model.tableName
    return this.knex.column(attributes).first().from(tableName).where({id})
      .then(result => result || null)
  }

  queryRecord (Model, options) {
    return this.query(Model, options).first()
  }

  createRecord (Model, data) {
    const tableName = Model.tableName
    return this.knex(tableName).insert(data)
  }

  updateRecord (Model, id, data) {
    const tableName = Model.tableName
    return this.knex(tableName).update(data).where('id', id)
  }

  deleteRecord (Model, id) {
    const tableName = Model.tableName
    return this.knex(tableName).where('id', id).delete()
  }
}
