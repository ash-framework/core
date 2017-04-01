// const { capitalize } = require('lodash')

// /**
//   @class QueryObjectTranslator
//   @extends Base
//   @private
// */
// module.exports = class QueryObjectTranslator {
//   /**
//     Creates an instance of QueryObjectTranslator.

//     @method constructor
//     @constructor
//     @private
//     @param {Object} Model instance
//   */
//   constructor (Model) {
//     this.Model = Model
//     this.queryBuilder = Model.adapter.knex(Model.tableName)
//   }

//   /**
//     Creates a new context in the query, wrapping the 'or' conditions

//     @method orBuilder
//     @private
//     @param {Array} orConditions
//   */
//   orBuilder (orConditions) {
//     const translator = this
//     this.queryBuilder.where(function () {
//       translator.queryBuilder = this
//       for (const condition of orConditions) {
//         const isOr = condition !== orConditions[0]
//         translator.buildQuery(condition, undefined, isOr)
//       }
//     })
//   }

//   /**
//     Adds a single clause to the queryBuilder

//     @method addClause
//     @private
//     @param {String} action The action to add to the query
//     @param {Array} args The arguments to the queryBuilder action
//     @param {Boolean} isOr Whether this action should be the 'or' version of itself
//   */
//   addClause (action, args, isOr) {
//     if (isOr) action = 'or' + capitalize(action)
//     this.queryBuilder = this.queryBuilder[action](...args)
//   }

//   /**
//     Detects which queryBuilder action to take based on
//     the incoming query object operator syntax

//     @method operatorFilter
//     @private
//     @param {String} colName Attribute name on the model
//     @param {any} operator Symbol representing the sql operator
//     @param {any} value The value to use in the operation
//     @param {any} isOr Whether the current context is an 'or'
//   */
//   operatorFilter (colName, operator, value, isOr) {
//     operator = operator.toLowerCase()
//     switch (operator) {
//       case '$or':
//         this.orBuilder(value)
//         break
//       case '$eq':
//         this.addClause('where', [colName, value], isOr)
//         break
//       case '$gt':
//         this.addClause('where', [colName, '>', value], isOr)
//         break
//       case '$gte':
//         this.addClause('where', [colName, '>=', value], isOr)
//         break
//       case '$lt':
//         this.addClause('where', [colName, '<', value], isOr)
//         break
//       case '$lte':
//         this.addClause('where', [colName, '<=', value], isOr)
//         break
//       case '$ne':
//         this.addClause('where', [colName, '!=', value], isOr)
//         break
//       case '$not':
//         this.addClause('whereNot', [colName, value], isOr)
//         break
//       case '$between':
//         this.addClause('whereBetween', [colName, value], isOr)
//         break
//       case '$notbetween':
//         this.addClause('whereNotBetween', [colName, value], isOr)
//         break
//       case '$in':
//         this.addClause('whereIn', [colName, value], isOr)
//         break
//       case '$notin':
//         this.addClause('whereNotIn', [colName, value], isOr)
//         break
//       case '$like':
//         this.addClause('where', [colName, 'LIKE', value], isOr)
//         break
//       case '$notlike':
//         this.addClause('where', [colName, 'NOT LIKE', value], isOr)
//         break
//       case '$ilike':
//         this.addClause('where', [colName, 'ILIKE', value], isOr)
//         break
//       case '$notilike':
//         this.addClause('where', [colName, 'NOT ILIKE', value], isOr)
//         break
//       case '$overlap':
//         this.addClause('where', [colName, '&&', value], isOr)
//         break
//       case '$contains':
//         this.addClause('where', [colName, '@>', value], isOr)
//         break
//       case '$contained':
//         this.addClause('where', [colName, '<@', value], isOr)
//         break
//       case '$null':
//         this.addClause('whereNull', [colName], isOr)
//         break
//       // default should throw error 'Unknown operator'
//     }
//   }

//   /**
//     @method buildQuery
//     @private
//     @param {Object} filter
//     @param {String} colName
//     @param {Boolean} isOr
//   */
//   buildQuery (filter, colName, isOr) {
//     const filterKeys = Object.keys(filter)
//     const isAnd = filterKeys.length > 1
//     if (isAnd) {
//       this.createNewContext(filter, colName, isOr)
//     } else {
//       this.handleFilter(filter, colName, isOr)
//     }
//   }

//   /**
//     @method createNewContext
//     @private
//     @param {any} filter
//     @param {any} colName
//     @param {any} isOr
//   */
//   createNewContext (filter, colName, isOr) {
//     const translator = this
//     const action = isOr ? 'orWhere' : 'where'
//     // Create a nested condition, e.g. id = 1 AND (name = 'blah' OR thing = 1)
//     translator.queryBuilder[action](function () {
//       translator.queryBuilder = this

//       translator.handleFilter(filter, colName, isOr)
//     })
//   }

//   /**
//     @method validateColumnName
//     @private
//     @param {any} colName
//     @return {Boolean}
//   */
//   validateColumnName (colName) {
//     // TODO: throw an error to show that the column name is invalid
//     return !colName || this.Model.definition.attributes[colName]
//   }

//   /**
//     @method handleFilter
//     @private
//     @param {any} filter
//     @param {any} colName
//     @param {any} isOr
//   */
//   handleFilter (filter, colName, isOr) {
//     let iterationCount = 0
//     for (const key of Object.keys(filter)) {
//       let value = filter[key]
//       if (iterationCount++ > 0) isOr = undefined
//       if (key[0] === '$') {
//         // its an operator
//         const operator = key
//         if (this.validateColumnName(colName)) {
//           this.operatorFilter(colName, operator, value, isOr)
//         }
//       } else {
//         // its not an operator so it is a column name
//         colName = key

//         if (value === null) {
//           this.operatorFilter(colName, '$null', null, isOr)
//         } else {
//           // if its not an object then this is a simple equality operation
//           if (typeof value !== 'object') {
//             if (this.validateColumnName(colName)) {
//               this.operatorFilter(colName, '$eq', value, isOr)
//             }
//           } else {
//             // value is actually a filter, and possibly need the colName for operator case
//             this.buildQuery(value, colName, isOr)
//           }
//         }
//       }
//     }
//   }

//   /**
//     @method translate
//     @param {any} filter
//     @private
//     @return {Object}
//   */
//   translate (filter) {
//     this.buildQuery(filter)

//     return this.queryBuilder
//   }
// }
