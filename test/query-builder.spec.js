/* global describe, test, beforeEach, beforeAll, afterAll, expect */
const QueryBuilder = require('../src/classes/query-builder')
const Database = require('./database')
const config = process.env.PG_CONNECTION_STRING
let db
let models

beforeAll(() => {
  db = new Database(config)
})

afterAll(() => {
  return db.knex.destroy()
})

describe('query-filter', () => {
  beforeEach(async () => {
    await db.knex.schema.dropTableIfExists('posts')
    await db.knex.schema.createTable('posts', table => {
      table.increments()
      table.string('title')
      table.string('description')
    })
    models = {
      Post: {
        name: 'Post',
        type: 'posts',
        tableName: 'posts',
        attributes: {id: 'number', title: 'string', description: 'string'}
      }
    }
  })

  test('{id: 1} should generate id = 1', async () => {
    // Given
    const filter = {id: 1}
    await db.knex('posts').insert([{title: 'My Post 1'}, {title: 'My Post 2'}])

    // When
    const builder = new QueryBuilder(db.knex)
    const result = await builder.buildFilter(models.Post, filter)

    // Then
    expect(result.length).toBe(1)
    expect(result[0].title).toBe('My Post 1')
  })

  // {id: 1}
  // id = 1

  // {id: {$gt: 1}}
  // id > 1

  // {id: {$gt: 1}, title: 'hello'}
  // id > 1 AND title = 'hello'

  // {$or: [{id: {$gt: 1}}, {title: 'hello'} ]}
  // id > 1 OR title = 'hello'

  // {id: {$gt: 10}, $or: [{title: 'hello'}, {title: {$like: '%bye%'}}]}
  // id > 10 AND (title = 'hello' OR title LIKE '%bye%')

  // {id: {$gt: 10}, $or: [{title: 'hello'}, {title: {$ilike: '%bye%'}, description: {$ilike: '%bye%'}}]}
  // id > 10 AND (title = 'hello' OR (title ILIKE '%bye%' AND description ILIKE '%bye%'))
})
