/* global describe, it, expect */
const Subject = require('../src/classes/serializer')

describe('serializer', () => {
  describe('.serialize', () => {
    it('when given a model definition and payload it should serialize payload', () => {
      // Given
      const Post = {
        name: 'Post',
        type: 'posts',
        tableName: 'posts',
        definition: {
          attributes: {id: 'number', title: 'string', description: 'string'},
          relationships: {}
        }
      }
      const posts = [
        {id: 1, title: 't1', description: 'd1'},
        {id: 2, title: 't2', description: 'd2'},
        {id: 3, title: 't3', description: 'd3'}
      ]

      // When
      const serializer = new Subject()
      const result = serializer.serialize(Post, posts, {baseUrl: 'http://localhost:8080/api/'})

      // Then
      expect(result.data.length).toBe(3)
      expect(result.data[0].id).toBe(1)
      expect(result.data[0].type).toBe('posts')
      expect(result.data[0].attributes.title).toBe('t1')
      expect(result.data[0].attributes.description).toBe('d1')
    })
  })
})
