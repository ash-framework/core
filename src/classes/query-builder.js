const { capitalize } = require('lodash')

module.exports = class QueryFilter {
  constructor (Model) {
    this.Model = Model
    this.queryBuilder = Model.adapter.knex(Model.tableName)
  }

  _orBuilder (orConditions) {
    const queryFilter = this
    this.queryBuilder.where(function () {
      queryFilter.queryBuilder = this
      for (const condition of orConditions) {
        const isOr = condition !== orConditions[0]
        queryFilter._buildQuery(condition, undefined, isOr)
      }
    })
  }

  _addClause (action, args, isOr) {
    if (isOr) action = 'or' + capitalize(action)
    this.queryBuilder = this.queryBuilder[action](...args)
  }

  _operatorFilter (colName, operator, value, isOr) {
    operator = operator.toLowerCase()
    switch (operator) {
      case '$or':
        this._orBuilder(value)
        break
      case '$eq':
        this._addClause('where', [colName, value], isOr)
        break
      case '$gt':
        this._addClause('where', [colName, '>', value], isOr)
        break
      case '$gte':
        this._addClause('where', [colName, '>=', value], isOr)
        break
      case '$lt':
        this._addClause('where', [colName, '<', value], isOr)
        break
      case '$lte':
        this._addClause('where', [colName, '<=', value], isOr)
        break
      case '$ne':
        this._addClause('where', [colName, '!=', value], isOr)
        break
      case '$not':
        this._addClause('whereNot', [colName, value], isOr)
        break
      case '$between':
        this._addClause('whereBetween', [colName, value], isOr)
        break
      case '$notbetween':
        this._addClause('whereNotBetween', [colName, value], isOr)
        break
      case '$in':
        this._addClause('whereIn', [colName, value], isOr)
        break
      case '$notin':
        this._addClause('whereNotIn', [colName, value], isOr)
        break
      case '$like':
        this._addClause('where', [colName, 'LIKE', value], isOr)
        break
      case '$notlike':
        this._addClause('where', [colName, 'NOT LIKE', value], isOr)
        break
      case '$ilike':
        this._addClause('where', [colName, 'ILIKE', value], isOr)
        break
      case '$notilike':
        this._addClause('where', [colName, 'NOT ILIKE', value], isOr)
        break
      case '$overlap':
        this._addClause('where', [colName, '&&', value], isOr)
        break
      case '$contains':
        this._addClause('where', [colName, '@>', value], isOr)
        break
      case '$contained':
        this._addClause('where', [colName, '<@', value], isOr)
        break
      // default should throw error 'Unknown operator'
    }
  }

  _buildQuery (filter, colName, isOr) {
    const filterKeys = Object.keys(filter)
    const isAnd = filterKeys.length > 1
    if (isAnd) {
      this._createNewContext(filter, colName, isOr)
    } else {
      this._handleFilter(filter, colName, isOr)
    }
  }

  _createNewContext (filter, colName, isOr) {
    const queryFilter = this
    const action = isOr ? 'orWhere' : 'where'
    // Create a nested condition, e.g. id = 1 AND (name = 'blah' OR thing = 1)
    queryFilter.queryBuilder[action](function () {
      queryFilter.queryBuilder = this

      queryFilter._handleFilter(filter, colName, isOr)
    })
  }

  _validateColumnName (colName) {
    // TODO: throw an error to show that the column name is invalid
    return !colName || this.Model.definition.attributes[colName]
  }

  _handleFilter (filter, colName, isOr) {
    let iterationCount = 0
    for (const key of Object.keys(filter)) {
      const value = filter[key]
      if (iterationCount++ > 0) isOr = undefined
      if (key[0] === '$') {
        // its an operator
        const operator = key
        if (this._validateColumnName(colName)) {
          this._operatorFilter(colName, operator, value, isOr)
        }
      } else {
        // its not an operator so it is a column name
        colName = key

        // if its not an object then this is a simple equality operation
        if (typeof value !== 'object') {
          if (this._validateColumnName(colName)) {
            this._operatorFilter(colName, '$eq', value, isOr)
          }
        } else {
          // value is actually a filter, and possibly need the colName for operator case
          this._buildQuery(value, colName, isOr)
        }
      }
    }
  }

  buildFilter (filter) {
    this._buildQuery(filter)

    return this.queryBuilder
  }
}
