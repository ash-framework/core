/* global describe, test, expect, jest */
const Model = require('../src/classes/model')
const Registry = require('../src/classes/registry')
const {set} = require('lodash')

describe('registry', () => {
  describe('registerModel', () => {
    test('basic register attribute getters', () => {
      // Given
      class PostModel extends Model {
        static attributes (attr) {
          attr('title', 'string')
          attr('description', 'string')
        }
      }
      const expected = {title: 'my title', description: 'my description'}
      
      // When
      Registry.registerModel(PostModel)
      const post = new PostModel(expected)

      // Then
      expect(post.attributes).toEqual(expected)
      expect(post.title).toEqual('my title')
      expect(post.description).toEqual('my description')
    })
    test('basic register attribute setters', () => {
      // Given
      class PostModel extends Model {
        static attributes (attr) {
          attr('title', 'string')
          attr('description', 'string')
        }
      }
      
      // When
      Registry.registerModel(PostModel)
      const post = new PostModel()
      post.title = 'my title'
      post.description = 'my description'

      // Then
      const expected = {title: 'my title', description: 'my description'}
      expect(post.attributes).toEqual(expected)
      expect(post.title).toEqual('my title')
      expect(post.description).toEqual('my description')
    })
    test('register default id getter', () => {
      // Given
      class PostModel extends Model {}
      const expected = {id: 1}
      
      // When
      Registry.registerModel(PostModel)
      const post = new PostModel(expected)

      // Then
      expect(PostModel.definition.attributes).toEqual({id: 'number'})
      expect(PostModel.idField).toEqual('id')
      expect(post.attributes).toEqual(expected)
      expect(post.id).toEqual(1)
    })
    test('register default id setter', () => {
      // Given
      class PostModel extends Model {}
      const expected = {id: 1}
      
      // When
      Registry.registerModel(PostModel)
      const post = new PostModel()
      post.id = 1

      // Then
      // expect(post.attributes).toEqual(expected)
      expect(post.id).toEqual(1)
    })
    test('register custom id getter ', () => {
      // Given
      class PostModel extends Model {
        static attributes (attr) {
          attr('id', 'string')
        }
      }
      
      // When
      Registry.registerModel(PostModel)
      const post = new PostModel({id: 'one'})

      // Then
      expect(PostModel.definition.attributes).toEqual({id: 'string'})
      expect(PostModel.idField).toEqual('id')
      expect(post.attributes.id).toEqual('one')
      expect(post.id).toEqual('one')
    })
    test('register custom id setter', () => {
      // Given
      class PostModel extends Model {
        static attributes (attr) {
          attr('id', 'string')
        }
      }
      
      // When
      Registry.registerModel(PostModel)
      const post = new PostModel()
      post.id = 'one'

      // Then
      expect(PostModel.definition.attributes).toEqual({id: 'string'})
      expect(PostModel.idField).toEqual('id')
      expect(post.attributes.id).toEqual('one')
      expect(post.id).toEqual('one')
    })
    test('setting invalid custom id value', () => {
      // Given
      class PostModel extends Model {
        static attributes (attr) {
          attr('id', 'string')
        }
      }
      
      // When
      Registry.registerModel(PostModel)
      const post = new PostModel()

      // Then
      expect(() => (post.id = 1)).toThrow()
    })
  })
})
