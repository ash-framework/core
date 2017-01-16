const _ = require('lodash')

module.exports = class QueryFilter {
  constructor (queryBuilder, Model) {
    this.Model = Model
    this.queryBuilder = queryBuilder
    this.depth = 0 // nested query depth
  }

  _orBuilder (array) {
    const queryFilter = this
    this.queryBuilder.where(function () {
      queryFilter.queryBuilder = this
      for (const value of array) {
        const orWhere = value !== array[0]
        queryFilter._buildQuery(value, null, orWhere)
      }
    })
  }

  _addClause (action, args, orWhere) {
    if (orWhere) action = 'or' + _.capitalize(action)
    this.queryBuilder = this.queryBuilder[action](...args)
  }

  _operatorFilter (colName, operator, value, orWhere) {
    switch (operator) {
      case '$or':
        this._orBuilder(value)
        break
      case '$eq':
        this._addClause('where', [colName, value], orWhere)
        break
      case '$gt':
        this._addClause('where', [colName, '>', value], orWhere)
        break
      case '$gte':
        this._addClause('where', [colName, '>=', value], orWhere)
        break
      case '$lt':
        this._addClause('where', [colName, '<', value], orWhere)
        break
      case '$lte':
        this._addClause('where', [colName, '<=', value], orWhere)
        break
      case '$ne':
        this._addClause('where', [colName, '!=', value], orWhere)
        break
      case '$not':
        this._addClause('whereNot', [colName, value], orWhere)
        break
      case '$between':
        this._addClause('whereBetween', [colName, value], orWhere)
        break
      case '$notBetween':
        this._addClause('whereNotBetween', [colName, value], orWhere)
        break
      case '$in':
        this._addClause('whereIn', [colName, value], orWhere)
        break
      case '$notIn':
        this._addClause('whereNotIn', [colName, value], orWhere)
        break
      case '$like':
        this._addClause('where', [colName, 'LIKE', value], orWhere)
        break
      case '$notLike':
        this._addClause('where', [colName, 'NOT LIKE', value], orWhere)
        break
      case '$iLike':
        this._addClause('where', [colName, 'ILIKE', value], orWhere)
        break
      case '$notILike':
        this._addClause('where', [colName, 'NOT ILIKE', value], orWhere)
        break
      case '$overlap':
        this._addClause('where', [colName, '&&', value], orWhere)
        break
      case '$contains':
        this._addClause('where', [colName, '@>', value], orWhere)
        break
      case '$contained':
        this._addClause('where', [colName, '<@', value], orWhere)
        break
      // default should throw error 'Unknown operator'
    }
  }

  _buildQuery (filter, colName, orWhere) {
    this.depth++
    const filterKeys = Object.keys(filter)
    if (this.depth > 1 && filterKeys.length > 1) {
      this._createNewContext(filter, colName, orWhere)
    } else {
      this._handleFilter(filter, colName, orWhere)
    }
  }

  _createNewContext (filter, colName, orWhere) {
    const queryFilter = this
    const action = orWhere ? 'orWhere' : 'where'
    // Create a nested condition, e.g. id = 1 AND (name = 'blah' OR thing = 1)
    queryFilter.queryBuilder[action](function () {
      queryFilter.queryBuilder = this
      queryFilter._handleFilter(filter, colName, orWhere)
    })
  }

  _validateColumnName (colName) {
    // TODO: throw an error to show that the column name is invalid
    return !colName || this.Model.attributes[colName]
  }

  _handleFilter (filter, colName, orWhere) {
    for (const key of Object.keys(filter)) {
      const value = filter[key]
      console.log(key, value)
      if (key[0] === '$') {
        // its an operator
        const operator = key
        if (this._validateColumnName(colName)) {
          this._operatorFilter(colName, operator, value, orWhere)
        }
      } else {
        // its not an operator so it is a column name
        colName = key

        // if its not an object then this is a simple equality operation
        if (typeof value !== 'object') {
          if (this._validateColumnName(colName)) {
            this._operatorFilter(colName, '$eq', value, orWhere)
          }
        } else {
          // value is actually a filter, and possibly need the colName for operator case
          this._buildQuery(value, colName, orWhere)
        }
      }
    }
  }

  buildFilter (filter) {
    this._buildQuery(filter)

    return this.queryBuilder
  }
}
