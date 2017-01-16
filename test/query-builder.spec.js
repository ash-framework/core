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

  test('{id: 1} should generate "id = 1"', async () => {
    // Given
    const filter = {id: 1}
    await db.knex('posts').insert([{title: 'My Post 1'}, {title: 'My Post 2'}])

    // When
    const builder = new QueryBuilder(db.knex, models.Post)
    const result = await builder.buildFilter(filter)

    // Then
    expect(result).toBe('\"id\" = 1')
  })

  test('{id: {$gt: 1}} should generate "id > 1"', async () => {
    // Given
    const filter = {id: {$gt: 1}}
    await db.knex('posts').insert([{title: 'My Post 1'}, {title: 'My Post 2'}])

    // When
    const builder = new QueryBuilder(db.knex, models.Post)
    const result = await builder.buildFilter(filter)

    // Then
    expect(result).toBe('\"id\" > 1')
  })

  test('{id: {$gt: 1}, title: "Post 2"} should generate "id > 1 AND title = \'Post 2\'"', async () => {
    // Given
    const filter = {id: {$gt: 1}, title: "Post 2"}
    await db.knex('posts').insert([{title: 'My Post 1'}, {title: 'My Post 2'}])

    // When
    const builder = new QueryBuilder(db.knex, models.Post)
    const result = await builder.buildFilter(filter)

    // Then
    expect(result).toBe('\"id\" > 1 and \"title\" = \'Post 2\'')
  })

  test('{id: {$gt: 1}, title: {$iLike: "%OsT 2"}} should generate "id > 1 AND title ILIKE \'%OsT 2\'"', async () => {
    // Given
    const filter = {id: {$gt: 1}, title: {$iLike: "%OsT 2"}}
    await db.knex('posts').insert([{title: 'My Post 1'}, {title: 'My Post 2'}])

    // When
    const builder = new QueryBuilder(db.knex, models.Post)
    const result = await builder.buildFilter(filter)

    // Then
    expect(result).toBe('\"id\" > 1 and \"title\" ILIKE \'%OsT 2\'')
  })

  test('{$or: [{id: 1}, {title: "Post 2"}]} should generate "id = 1 OR title = \"Post 2\""', async () => {
    // Given
    const filter = {$or: [{id: 1}, {title: "Post 2"}]}
    await db.knex('posts').insert([{title: 'My Post 1'}, {title: 'My Post 2'}])

    // When
    const builder = new QueryBuilder(db.knex, models.Post)
    const result = await builder.buildFilter(filter)

    // Then
    expect(result).toBe('(\"id\" = 1 or \"title\" = \'Post 2\')')
  })

  test('{id: {$gt: 10}, $or: [{title: "hello"}, {title: {$like: "%bye%"}}]} should generate "id > 10 AND (title = \'hello\' OR title LIKE \'%bye%\')"', async () => {
    // Given
    const filter = {id: {$gt: 10}, $or: [{title: "hello"}, {title: {$like: "%bye%"}}]}
    await db.knex('posts').insert([{title: 'My Post 1'}, {title: 'My Post 2'}])

    // When
    const builder = new QueryBuilder(db.knex, models.Post)
    const result = await builder.buildFilter(filter)

    // Then
    expect(result).toBe('\"id\" > 10 and (\"title\" = \'hello\' or \"title\" LIKE \'%bye%\')')
  })

  test('{id: {$gt: 10}, $or: [{title: "hello"}, {title: {$ilike: "%bye%"}, description: {$ilike: "%bye%"}}]} should generate "id > 10 AND (title = \'hello\' OR (title ILIKE \'%bye%\' AND description ILIKE \'%bye%\'))"', async () => {
    // Given
    const filter = {id: {$gt: 10}, $or: [{title: 'hello'}, {title: {$ilike: '%bye%'}, description: {$ilike: '%bye%'}}]}
    await db.knex('posts').insert([{title: 'My Post 1'}, {title: 'My Post 2'}])

    // When
    const builder = new QueryBuilder(db.knex, models.Post)
    const result = await builder.buildFilter(filter)

    // Then
    expect(result).toBe('\"id\" > 10 and (\"title\" = \'hello\' or (\"title\" ILIKE \'%bye%\' and \"description\" ILIKE \'%bye%\'))')
  })

  // {id: 1}
  // id = 1

  // {id: {$gt: 1}}
  // id > 1

  // {id: {$gt: 1}, title: 'hello'}
  // id > 1 AND title = 'hello'

  // {$or: [ {id: {$gt: 1}}, {title: 'hello', name: 'blah'} ]}
  // id > 1 OR (title = 'hello' AND name = 'blah')

  // {id: {$gt: 10}, $or: [{title: 'hello'}, {title: {$like: '%bye%'}}]}
  // id > 10 AND (title = 'hello' OR title LIKE '%bye%')

  // {id: {$gt: 10}, $or: [{title: 'hello'}, {title: {$ilike: '%bye%'}, description: {$ilike: '%bye%'}}]}
  // id > 10 AND (title = 'hello' OR (title ILIKE '%bye%' AND description ILIKE '%bye%'))

  // Notes:
  // - drop $and syntax


})
