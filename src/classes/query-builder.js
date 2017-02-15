module.exports = class QueryFilter {
  constructor (knex) {
    this.knex = knex
  }

  buildFilter (Model, filter) {
    // for (const key of Object.keys(filter)) {
    //   const value = filter[key]
    //   if (key[0] === '$') {
    //     // its an operator
    //     const operator = key
    //     switch (operator) {
    //       case '$and':
    //         this.knex.where(function () {

    //         })
    //         break
    //       case '$or':
    //         this.knex.orWhere(function () {

    //         })
    //         break
    //       case '$gt':
    //         this.knex = this.knex.where(key, '>', value)
    //         break
    //       case '$gte':
    //         this.knex = this.knex.where(key, '>=', value)
    //         break
    //       case '$lt':
    //         this.knex = this.knex.where(key, '<', value)
    //         break
    //       case '$lte':
    //         this.knex = this.knex.where(key, '<=', value)
    //         break
    //       case '$ne':
    //         this.knex = this.knex.where(key, '!=', value)
    //         break
    //       case '$not':
    //         this.knex = this.knex.whereNot(key, value)
    //         break
    //       case '$between':
    //         this.knex = this.knex.whereBetween(key, value)
    //         break
    //       case '$notBetween':
    //         this.knex = this.knex.whereNotBetween(key, value)
    //         break
    //       case '$in':
    //         this.knex = this.knex.whereIn(key, value)
    //         break
    //       case '$notIn':
    //         this.knex = this.knex.whereNotIn(key, value)
    //         break
    //       case '$like':
    //         this.knex = this.knex.where(key, 'LIKE', value)
    //         break
    //       case '$notLike':
    //         this.knex = this.knex.where(key, 'NOT LIKE', value)
    //         break
    //       case '$iLike':
    //         this.knex = this.knex.where(key, 'ILIKE', value)
    //         break
    //       case '$notILike':
    //         this.knex = this.knex.where(key, 'NOT ILIKE', value)
    //         break
    //       case '$overlap':
    //         this.knex = this.knex.where(key, '&&', value)
    //         break
    //       case '$contains':
    //         this.knex = this.knex.where(key, '@>', value)
    //         break
    //       case '$contained':
    //         this.knex = this.knex.where(key, '<@', value)
    //         break
    //     }
    //   } else {
    //     // its not an operator so it is a column name
    //     // verify its valid via Model.attributes
    //     if (Model.attributes[key]) {
    //       // if its not an object then this is a simple AND operation
    //       if (typeof value !== 'object') {
    //         this.knex = this.knex.where(key, value)
    //       } else {
    //         //
    //       }
    //     }
    //   }
    // }
  }
}
