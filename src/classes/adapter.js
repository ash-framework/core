const Base = require('./base')
const Knex = require('knex')
const {get} = require('lodash')

module.exports = class Adapter extends Base {
  /**
   * Sets up the knex query builder instance
   * @constructor
   */
  constructor (config) {
    super()
    this.knex = Knex({
      client: 'pg',
      connection: config,
      searchPath: 'knex,public'
    })
  }

  fieldsForModel (Model) {
    return Object.keys(get(Model, 'definition.attributes'), {})
  }

  include () {

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
    if (options.include) query = this.include(query, options.include)
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
