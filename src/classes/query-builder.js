const capitalise = word => {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

module.exports = class QueryFilter {
  constructor (knex, Model) {
    this.Model = Model
    this.queryBuilder = knex.queryBuilder()
    this.depth = 0
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
    if (orWhere) action = 'or' + capitalise(action)
    this.queryBuilder = this.queryBuilder[action](...args)
  }

  _operatorFilter (colName, operator, value, orWhere) {
    switch (operator) {
      case '$or':
        this._orBuilder(value)
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
    console.log(filter, colName, orWhere)
    if (this.depth > 1 && filterKeys.length > 1) {
      this._createNewContext(filter, colName, orWhere)
    } else {
      this._handleFilter(filter, colName, orWhere)
    }
  }

  _createNewContext (filter, colName, orWhere) {
    const queryFilter = this
    const action = orWhere ? 'orWhere' : 'where'
    queryFilter.queryBuilder[action](function () {
      queryFilter.queryBuilder = this
      queryFilter._handleFilter(filter, colName, orWhere)
    })
  }

  _handleFilter (filter, colName, orWhere) {
    const queryFilter = this
    for (const key of Object.keys(filter)) {
      const value = filter[key]
      if (key[0] === '$') {
        // its an operator
        const operator = key
        queryFilter._operatorFilter(colName, operator, value, orWhere)
      } else {
        // its not an operator so it is a column name
        // verify its valid via Model.attributes
        if (!queryFilter.Model.attributes[key]) return // TODO: throw an error to show that the column name is invalid

        // if its not an object then this is a simple AND operation
        if (typeof value !== 'object') {
          queryFilter._addClause('where', [key, value], orWhere)
        } else {
          // value is actually a filter, and possibly need the key for operator case
          queryFilter._buildQuery(value, key, orWhere)
        }
      }
    }
  }

  buildFilter (filter) {
    this._buildQuery(filter)

    return this.queryBuilder.toString().replace('select * where ', '')
  }
}
