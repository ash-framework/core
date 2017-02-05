/* global describe, test, expect, jest */
const Model = require('../src/classes/model')
const {set} = require('lodash')

describe('model', () => {
  describe('model instance properties and methods', () => {
    test('attributes hash', () => {
      // Given
      class PostModel extends Model {}
      PostModel.definition = {attributes: {}, relationships: {}}
      PostModel.definition.attributes = {title: {type: 'string'}}
      const expected = {title: 'my title'}
      // When
      const post = new PostModel(expected)

      // Then
      expect(post.attributes).toEqual(expected)
    })
    test('attributes hash must be an object', () => {
      // Given
      class PostModel extends Model {}
      PostModel.definition = {attributes: {}, relationships: {}}
      PostModel.definition.attributes = {title: {type: 'string'}}

      // When/Then
      expect(() => new PostModel([])).toThrow()
      expect(() => new PostModel('asd')).toThrow()
      expect(() => new PostModel(123)).toThrow()
    })
    test('attributes hash ignores invalid attribute keys', () => {
      // Given
      class PostModel extends Model {}
      PostModel.definition = {attributes: {}, relationships: {}}
      PostModel.definition.attributes = {title: {type: 'string'}}
      const expected = {title: 'my title', description: 'my description'}

      // When
      const post = new PostModel(expected)

      // Then
      expect(post.attributes).not.toEqual(expected)
    })
    test('attributes hash ignores invalid relationship keys', () => {
      // Given
      class PostModel extends Model {}
      set(PostModel, 'definition', {attributes: {}, relationships: {comments: {}}})

      // When
      const post = new PostModel({comments: [{}], invalid: true})

      // Then
      expect(post.attributes.comments).toEqual([{}])
      expect(post.attributes.invalid).toBeUndefined()
    })
    test('.modelName', () => {
      // Given
      class PostModel extends Model {}

      // When
      const post = new PostModel({})

      // Then
      expect(post.modelName).toBe('post')
    })
    test('incorrect modelName throws error', () => {
      // Given
      class PostModelName extends Model {}

      // When/Then
      expect(() => new PostModelName({})).toThrow()
    })
    test('modelName is lowercase singular', () => {
      // Given
      class PostsModel extends Model {}

      // When
      const post = new PostsModel({})

      // Then
      expect(post.modelName).toBe('post')
    })
    test('modelName is dasherized', () => {
      // Given
      class MyGreatPostsModel extends Model {}

      // When
      const post = new MyGreatPostsModel({})

      // Then
      expect(post.modelName).toBe('my-great-post')
    })
    test('.tableName should default to model name', () => {
      // Given
      class PostModel extends Model {}

      // When/Then
      expect(PostModel.tableName).toBe('posts')
    })
    test('.tableName should default to lower case', () => {
      // Given
      class MyGreatPostModel extends Model {}

      // When/Then
      expect(MyGreatPostModel.tableName).toBe('my_great_posts')
    })
    test('.type', () => {
      // Given
      class MyGreatPostModel extends Model {}

      // When/Then
      expect(MyGreatPostModel.type).toBe('my-great-posts')
    })
    test('.idField', () => {
      // Given
      class PostModel extends Model {}

      // When/Then
      expect(PostModel.idField).toBe('id')
    })
    test('.adapter', () => {
      // Given
      class PostModel extends Model {}
      const adapterForMock = jest.fn()
      PostModel.store = {adapterFor: adapterForMock}

      // When
      PostModel.adapter

      // Then
      expect(adapterForMock).toHaveBeenCalledWith('post')
    })
    test('.serializer', () => {
      // Given
      class PostModel extends Model {}
      const serializerForMock = jest.fn()
      PostModel.store = {serializerFor: serializerForMock}

      // When
      PostModel.serializer

      // Then
      expect(serializerForMock).toHaveBeenCalledWith('post')
    })
    test('.save', () => {
      // Given
      class PostModel extends Model {}
      PostModel.definition = {attributes: {}, relationships: {}}
      PostModel.definition.attributes = {title: {type: 'string'}}
      const createRecordMock = jest.fn()
      PostModel.store = {adapterFor: () => {
        return {createRecord: createRecordMock}
      }}

      // When
      const post = new PostModel({title: 'my title'})
      post.save()

      // Then
      expect(createRecordMock).toHaveBeenCalledWith(PostModel, post.attributes)
    })
    test('.saveAll', () => {
      // Given
      // When
      // Then
    })
    test('.delete', () => {
      // Given
      class PostModel extends Model {}
      PostModel.definition = {attributes: {}, relationships: {}}
      PostModel.definition.attributes = {title: {type: 'string'}}
      const deleteRecordMock = jest.fn()
      PostModel.store = {adapterFor: () => {
        return {deleteRecord: deleteRecordMock}
      }}

      // When
      const post = new PostModel({title: 'my title'})
      post.delete()

      // Then
      expect(deleteRecordMock).toHaveBeenCalledWith(PostModel, post.id)
    })
    test('implicit id attribute', () => {
      // Given
      class PostModel extends Model {}

      // When
      const model = new PostModel({id: 1})

      // Then
      expect(model.attributes.id).toBe(1)
    })
    test('explicit id attribute', () => {
      // Given
      class PostModel extends Model {
        static get idField () {
          return 'postId'
        }
      }
      set(PostModel, 'definition.attributes', {postId: {type: 'number'}})

      // When
      const model = new PostModel({postId: 1})

      // Then
      expect(model.attributes.postId).toBe(1)
    })
    test('.isNew is true', () => {
      // Given
      class PostModel extends Model {}

      // When
      const model = new PostModel()

      // Then
      expect(model.isNew).toBe(true)
    })
    test('.isNew if false', () => {
      // Given
      class PostModel extends Model {}

      // When
      const model = new PostModel({id: 1})

      // Then
      expect(model.isNew).toBe(false)
    })
    test('.toJSON no properties', () => {
      // Given
      class PostModel extends Model {}

      // When
      const model = new PostModel()
      const actual = model.toJSON()

      // Then
      expect(actual).toEqual({})
    })
    test('.toJSON no valid properties', () => {
      // Given
      class PostModel extends Model {}

      // When
      const model = new PostModel({fake: true, false: false})
      const actual = model.toJSON()

      // Then
      expect(actual).toEqual({})
    })
    test('.toJSON valid properties', () => {
      // Given
      class PostModel extends Model {}
      set(PostModel, 'definition.attributes', {name: {type: 'string'}})

      // When
      const model = new PostModel({id: 1, name: 'Joe Bloggs', fake: 'fake'})
      const actual = model.toJSON()

      // Then
      expect(actual).toEqual({id: 1, name: 'Joe Bloggs'})
    })
    test('.isValid', () => {
      // Given
      // When
      // Then
    })
    test('validation with bad string value when setting attributes', () => {
      // Given
      class PostModel extends Model {}
      set(PostModel, 'definition.attributes', {name: {type: 'string'}})
      const model = new PostModel()

      // When/Then
      expect(() => (model.attributes = {name: 1})).toThrow()
    })
    test('validation with bad number value when setting attributes', () => {
      // Given
      class PostModel extends Model {}
      set(PostModel, 'definition.attributes', {age: {type: 'number'}})
      const model = new PostModel()

      // When/Then
      expect(() => (model.attributes = {age: 'age'})).toThrow()
    })
    test('validation with good number value when setting attributes', () => {
      // Given
      class PostModel extends Model {}
      set(PostModel, 'definition.attributes', {age: {type: 'number'}})
      const model = new PostModel()

      // When/Then
      expect(() => (model.attributes = {age: 1})).not.toThrow()
    })
    test('validation with good date value when setting attributes', () => {
      // Given
      class PostModel extends Model {}
      set(PostModel, 'definition.attributes', {date: {type: 'date'}})
      const model = new PostModel()

      // When/Then
      expect(() => (model.attributes = {date: new Date()})).not.toThrow()
    })
    test('validation with bad date value when setting attributes', () => {
      // Given
      class PostModel extends Model {}
      set(PostModel, 'definition.attributes', {date: {type: 'date'}})
      const model = new PostModel()

      // When/Then
      expect(() => (model.attributes = {date: 'not a date'})).toThrow()
    })
    test('validation with good boolean value when setting attributes', () => {
      // Given
      class PostModel extends Model {}
      set(PostModel, 'definition.attributes', {bool: {type: 'boolean'}})
      const model = new PostModel()

      // When/Then
      expect(() => (model.attributes = {bool: true})).not.toThrow()
    })
    test('validation with bad boolean value when setting attributes', () => {
      // Given
      class PostModel extends Model {}
      set(PostModel, 'definition.attributes', {bool: {type: 'boolean'}})
      const model = new PostModel()

      // When/Then
      expect(() => (model.attributes = {bool: 'not a boolean'})).toThrow()
    })
    test('updating property on attributes does not change attributes hash', () => {
      // Given
      class PostModel extends Model {}
      set(PostModel, 'definition.attributes', {bool: {type: 'boolean'}})
      const model = new PostModel({bool: true})
      model.attributes.bool = false

      // When/Then
      expect(model.attributes.bool).toBe(true)
    })
    test('default value for attribute', () => {
      // Given
      class PostModel extends Model {}
      set(PostModel, 'definition.attributes', {bool: {type: 'boolean', defaultValue: true}})
      const model = new PostModel()

      // When/Then
      expect(model.attributes.bool).toBe(true)
    })
    test('default value as a function for attribute', () => {
      // Given
      class PostModel extends Model {}
      set(PostModel, 'definition.attributes', {default: {
        type: 'string',
        defaultValue: function () { return 'default' }
      }})
      const model = new PostModel()

      // When/Then
      expect(model.attributes.default).toBe('default')
    })
  })
})
