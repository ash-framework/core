/* global describe, it, beforeEach, beforeAll, afterAll, expect */
const Adapter = require('../src/classes/adapter')
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

describe('adapter', () => {
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

  describe('findAll', () => {
    it('should return all data for a given model', async () => {
      // Given
      await db.knex('posts').insert([{title: 'My Post 1'}, {title: 'My Post 2'}])

      // When
      const adapter = new Adapter(config)
      const data = await adapter.findAll(models.Post)

      // Then
      expect(data.length).toBe(2)
      expect(data[0].title).toBe('My Post 1')
    })

    it('should return an empty array if no records are found', async () => {
      // When
      const adapter = new Adapter(config)
      const data = await adapter.findAll(models.Post)

      // Then
      expect(data).toHaveLength(0)
      expect(Array.isArray(data)).toBe(true)
    })
  })

  describe('query', () => {
    it('should return all data for a given model', async () => {
      // Given
      await db.knex('posts').insert([{title: 'My Post 1'}, {title: 'My Post 2'}])

      // When
      const adapter = new Adapter(config)
      const data = await adapter.query(models.Post, {})

      // Then
      expect(data.length).toBe(2)
      expect(data[0].title).toBe('My Post 1')
    })

    it('should return an empty array if no records are found', async () => {
      // When
      const adapter = new Adapter(config)
      const data = await adapter.query(models.Post, {})

      // Then
      expect(data).toHaveLength(0)
      expect(Array.isArray(data)).toBe(true)
    })

    it('should be possible to include related records', async () => {

    })
    it('should be possible to specify sparse field sets for primary data', async () => {
      // Given
      await db.knex('posts').insert([{title: 'p1', description: 'd1'}, {title: 'p2', description: 'd2'}])

      // When
      const adapter = new Adapter(config)
      const data = await adapter.query(models.Post, {fields: {posts: 'id, title'}})

      // Then
      expect(data.length).toBe(2)
      expect(data[0].id).toBe(1)
      expect(data[0].title).toBe('p1')
      expect(data[0].description).toBeFalsy()
      expect(data[1].id).toBe(2)
      expect(data[1].title).toBe('p2')
      expect(data[1].description).toBeFalsy()
    })
    it('should be possible to page results', async () => {
      // Given
      await db.knex('posts').insert([
        {title: 'My Post 1'}, {title: 'My Post 2'}, {title: 'My Post 3'}, {title: 'My Post 4'}
      ])

      // When
      const adapter = new Adapter(config)
      const data = await adapter.query(models.Post, {page: {number: 2, size: 2}})

      // Then
      expect(data.length).toBe(2)
      expect(data[0].title).toBe('My Post 3')
      expect(data[1].title).toBe('My Post 4')
    })
    it('should be possible to sort results by a single column ASC', async () => {
      // Given
      await db.knex('posts').insert([
        {title: 'S'}, {title: 'A'}, {title: 'G'}, {title: 'B'}
      ])

      // When
      const adapter = new Adapter(config)
      const data = await adapter.query(models.Post, {sort: 'title'})

      // Then
      expect(data.length).toBe(4)
      expect(data[0].id).toBe(2)
      expect(data[1].id).toBe(4)
      expect(data[2].id).toBe(3)
      expect(data[3].id).toBe(1)
    })
    it('should be possible to sort results by a single column DESC', async () => {
      // Given
      await db.knex('posts').insert([
        {title: 'S'}, {title: 'A'}, {title: 'G'}, {title: 'B'}
      ])

      // When
      const adapter = new Adapter(config)
      const data = await adapter.query(models.Post, {sort: '-title'})

      // Then
      expect(data.length).toBe(4)
      expect(data[0].id).toBe(1)
      expect(data[1].id).toBe(3)
      expect(data[2].id).toBe(4)
      expect(data[3].id).toBe(2)
    })
    it('should be possible to sort results by multiple columns', async () => {
      // Given
      await db.knex('posts').insert([
        {title: 'A', id: 50}, {title: 'S', id: 1}, {title: 'A', id: 2}, {title: 'B', id: 3}
      ])

      // When
      const adapter = new Adapter(config)
      const data = await adapter.query(models.Post, {sort: '-title,id'})

      // Then
      expect(data.length).toBe(4)
      expect(data[0].id).toBe(1)
      expect(data[1].id).toBe(3)
      expect(data[2].id).toBe(2)
      expect(data[3].id).toBe(50)
    })
    it('should be possible to filter results by various criteria', async () => {
      // Given
      await db.knex('posts').insert([
        {title: 'My Post 1'}, {title: 'My Post 2'}, {title: 'My Post 3'}, {title: 'My Post 4'}
      ])

      // When
      const adapter = new Adapter(config)
      const data = await adapter.query(models.Post, {page: {number: 2, size: 2}})

      // Then
      expect(data.length).toBe(2)
      expect(data[0].title).toBe('My Post 3')
      expect(data[1].title).toBe('My Post 4')
    })
  })

  describe('findRecord', () => {
    it('should return a single record by id', async () => {
      // Given
      await db.knex('posts').insert([{title: 'My Post 1'}, {title: 'My Post 2'}])

      // When
      const adapter = new Adapter(config)
      const data = await adapter.findRecord(models.Post, 2)

      // Then
      expect(data.title).toBe('My Post 2')
    })

    it('should return null if the id does not exist', async () => {
      // When
      const adapter = new Adapter(config)
      const data = await adapter.findRecord(models.Post, 999)

      // Then
      expect(data).toBeNull()
    })
  })
})
