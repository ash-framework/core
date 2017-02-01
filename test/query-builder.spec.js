/* global describe, test, beforeEach, beforeAll, afterAll, expect */
const QueryObjectTranslator = require('../src/classes/query-object-translator')
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
        tableName: 'posts',
        modelName: 'Post',
        type: 'posts',
        definition: {
          attributes: {id: 'number', title: 'string', description: 'string'}
        },
        adapter: { knex: db.knex }
      }
    }
  })

  test('{id: 1} should generate "id = 1"', async () => {
    // Given
    const filter = {id: 1}

    // When
    const builder = new QueryObjectTranslator(models.Post)
    const result = builder.buildFilter(filter)

    // Then
    expect(result.toString()).toBe('select * from \"posts\" where \"id\" = 1')
  })

  test('{id: {$gt: 1}} should generate "id > 1"', async () => {
    // Given
    const filter = {id: {$gt: 1}}

    // When
    const builder = new QueryObjectTranslator(models.Post)
    const result = builder.buildFilter(filter)

    // Then
    expect(result.toString()).toBe('select * from \"posts\" where \"id\" > 1')
  })

  test('{id: {$gt: 1}, title: "Post 2"} should generate "id > 1 AND title = \'Post 2\'"', async () => {
    // Given
    const filter = {id: {$gt: 1}, title: "Post 2"}

    // When
    const builder = new QueryObjectTranslator(models.Post)
    const result = builder.buildFilter(filter)

    // Then
    expect(result.toString()).toBe('select * from \"posts\" where (\"id\" > 1 and \"title\" = \'Post 2\')')
  })

  test('{id: {$gt: 1}, title: {$iLike: "%OsT 2"}} should generate "id > 1 AND title ILIKE \'%OsT 2\'"', async () => {
    // Given
    const filter = {id: {$gt: 1}, title: {$iLike: "%OsT 2"}}

    // When
    const builder = new QueryObjectTranslator(models.Post)
    const result = builder.buildFilter(filter)

    // Then
    expect(result.toString()).toBe('select * from \"posts\" where (\"id\" > 1 and \"title\" ILIKE \'%OsT 2\')')
  })

  test('{$or: [{id: 1}, {title: "Post 2"}]} should generate "id = 1 OR title = \"Post 2\""', async () => {
    // Given
    const filter = {$or: [{id: 1}, {title: "Post 2"}]}

    // When
    const builder = new QueryObjectTranslator(models.Post)
    const result = builder.buildFilter(filter)

    // Then
    expect(result.toString()).toBe('select * from \"posts\" where (\"id\" = 1 or \"title\" = \'Post 2\')')
  })

  test('{id: {$gt: 10}, $or: [{title: "hello"}, {title: {$like: "%bye%"}}]} should generate "id > 10 AND (title = \'hello\' OR title LIKE \'%bye%\')"', async () => {
    // Given
    const filter = {id: {$gt: 10}, $or: [{title: "hello"}, {title: {$like: "%bye%"}}]}

    // When
    const builder = new QueryObjectTranslator(models.Post)
    const result = builder.buildFilter(filter)

    // Then
    expect(result.toString()).toBe('select * from \"posts\" where (\"id\" > 10 and (\"title\" = \'hello\' or \"title\" LIKE \'%bye%\'))')
  })

  test('{$or: [{title: "hello"}, {title: {$like: "%bye%"}}], id: {$gt: 10}} should generate "(title = \'hello\' OR title LIKE \'%bye%\') AND id > 10"', async () => {
    // Given
    const filter = {$or: [{title: "hello"}, {title: {$like: "%bye%"}}], id: {$gt: 10}}

    // When
    const builder = new QueryObjectTranslator(models.Post)
    const result = builder.buildFilter(filter)

    // Then
    expect(result.toString()).toBe('select * from \"posts\" where ((\"title\" = \'hello\' or \"title\" LIKE \'%bye%\') and \"id\" > 10)')
  })

  test('{id: {$gt: 10}, $or: [{title: "hello"}, {title: {$iLike: "%bye%"}, description: {$iLike: "%bye%"}}]} should generate "id > 10 AND (title = \'hello\' OR (title ILIKE \'%bye%\' AND description ILIKE \'%bye%\'))"', async () => {
    // Given
    const filter = {id: {$gt: 10}, $or: [{title: 'hello'}, {title: {$iLike: '%bye%'}, description: {$iLike: '%bye%'}}]}

    // When
    const builder = new QueryObjectTranslator(models.Post)
    const result = builder.buildFilter(filter)

    // Then
    expect(result.toString()).toBe('select * from \"posts\" where (\"id\" > 10 and (\"title\" = \'hello\' or (\"title\" ILIKE \'%bye%\' and \"description\" ILIKE \'%bye%\')))')
  })

  test('{id: {$gt: 10}, $or: [{title: "hello"}, {title: {$IliKe: "%bye%"}, description: {$iLIkE: "%bye%"}}]} should generate "id > 10 AND (title = \'hello\' OR (title ILIKE \'%bye%\' AND description ILIKE \'%bye%\'))"', async () => {
    // Given
    const filter = {title: {$IliKe: '%bye%'}, description: {$iLIkE: '%bye%'}}

    // When
    const builder = new QueryObjectTranslator(models.Post)
    const result = builder.buildFilter(filter)

    // Then
    expect(result.toString()).toBe('select * from \"posts\" where (\"title\" ILIKE \'%bye%\' and \"description\" ILIKE \'%bye%\')')
  })

  test('{id: {$gt: 10}, $or: [{title: "hello"}, {title: {}, description: {$iLIkE: "%bye%"}}]} should generate "id > 10 AND (title = \'hello\' OR (title ILIKE \'%bye%\' AND description ILIKE \'%bye%\'))"', async () => {
    // Given
    const filter = {title: {$IliKe: '%bye%'}, description: {}}

    // When
    const builder = new QueryObjectTranslator(models.Post)
    const result = builder.buildFilter(filter)

    // Then
    expect(result.toString()).toBe('select * from \"posts\" where (\"title\" ILIKE \'%bye%\')')
  })

  test('{blah: 1} should be ignored since "blah" is not a Post attribute', async () => {
    // Given
    const filter = {blah: 1}

    // When
    const builder = new QueryObjectTranslator(models.Post)
    const result = builder.buildFilter(filter)

    // Then
    expect(result.toString()).toBe('select * from \"posts\"')
  })

  test('{id: {$gt: 1}, blah: 1} should generate "id > 1"', async () => {
    // Given
    const filter = {id: {$gt: 1}, blah: 1}

    // When
    const builder = new QueryObjectTranslator(models.Post)
    const result = builder.buildFilter(filter)

    // Then
    expect(result.toString()).toBe('select * from \"posts\" where (\"id\" > 1)')
  })
})
