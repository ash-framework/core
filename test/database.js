const Knex = require('knex')

module.exports = class Database {
  constructor (config) {
    this.config = config
    this.knex = Knex({
      client: 'pg',
      connection: config,
      searchPath: 'knex,public'
    })
  }
}
