/* global describe, test, expect, jest */
const Model = require('../src/classes/model')
const Registry = require('../src/classes/registry')

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
      expect(PostModel.definition.attributes).toEqual({id: {type: 'number'}})
      expect(PostModel.idField).toEqual('id')
      expect(post.attributes).toEqual(expected)
      expect(post.id).toEqual(1)
    })
    test('register default id setter', () => {
      // Given
      class PostModel extends Model {}

      // When
      Registry.registerModel(PostModel)
      const post = new PostModel()
      post.id = 1

      // Then
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
      expect(PostModel.definition.attributes).toEqual({id: {type: 'string'}})
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
      expect(PostModel.definition.attributes).toEqual({id: {type: 'string'}})
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
    test('attribute default', () => {
      // Given
      class PostModel extends Model {
        static attributes (attr) {
          attr('bool', 'boolean', {defaultValue: true})
        }
      }

      // When
      Registry.registerModel(PostModel)
      const model = new PostModel()

      // Then
      expect(model.bool).toBe(true)
    })
    test('invalid value for attribute default', () => {
      // Given
      class PostModel extends Model {
        static attributes (attr) {
          attr('id', 'boolean', {defaultValue: 'not valid'})
        }
      }

      // When/Then
      expect(() => (Registry.registerModel(PostModel))).toThrow()
    })
    test('function attribute default is not invalid', () => {
      // Given
      class PostModel extends Model {
        static attributes (attr) {
          attr('id', 'boolean', {
            defaultValue: function () {
              return true
            }
          })
        }
      }

      // When/Then
      expect(() => (Registry.registerModel(PostModel))).not.toThrow()
    })

    test('hasMany relationship definition', () => {
      // Given
      class PostModel extends Model {
        static relationships (relation) {
          relation('hasMany', 'comment')
        }
      }
      class CommentModel extends Model {}
      PostModel.store = {
        modelFor: jest.fn().mockReturnValue(CommentModel)
      }

      // When
      Registry.registerModel(PostModel)

      // Then
      expect(PostModel.definition.relationships).toEqual({
        comments: {type: 'hasMany', modelFrom: PostModel.modelName, keyFrom: 'id', modelTo: CommentModel.modelName, keyTo: 'postId'}
      })
    })

    test('belongsTo relationship definition', () => {
      // Given
      class PostModel extends Model {
        static relationships (relation) {
          relation('belongsTo', 'author')
        }
      }
      class AuthorModel extends Model {}
      PostModel.store = {
        modelFor: jest.fn().mockReturnValue(AuthorModel)
      }

      // When
      Registry.registerModel(PostModel)

      // Then
      expect(PostModel.definition.relationships).toEqual({
        author: {type: 'belongsTo', modelFrom: PostModel.modelName, keyFrom: 'authorId', modelTo: AuthorModel.modelName, keyTo: 'id'}
      })
    })

    test('relationship definitions custom name option', () => {
      // Given
      class PostModel extends Model {
        static relationships (relation) {
          relation('hasMany', 'comment', {name: 'commentz'})
        }
      }
      class CommentModel extends Model {}
      PostModel.store = {
        modelFor: jest.fn().mockReturnValue(CommentModel)
      }

      // When
      Registry.registerModel(PostModel)

      // Then
      expect(PostModel.definition.relationships).toEqual({
        commentz: {type: 'hasMany', modelFrom: PostModel.modelName, keyFrom: 'id', modelTo: CommentModel.modelName, keyTo: 'postId'}
      })
    })

    test('relationship definitions custom keyFrom option', () => {
      // Given
      class PostModel extends Model {
        static relationships (relation) {
          relation('hasMany', 'comment', {keyFrom: 'customId'})
        }
      }
      class CommentModel extends Model {}
      PostModel.store = {
        modelFor: jest.fn().mockReturnValue(CommentModel)
      }

      // When
      Registry.registerModel(PostModel)

      // Then
      expect(PostModel.definition.relationships).toEqual({
        comments: {type: 'hasMany', modelFrom: PostModel.modelName, keyFrom: 'customId', modelTo: CommentModel.modelName, keyTo: 'postId'}
      })
    })

    test('relationship definitions custom keyTo option', () => {
      // Given
      class PostModel extends Model {
        static relationships (relation) {
          relation('hasMany', 'comment', {keyTo: 'customId'})
        }
      }
      class CommentModel extends Model {}
      PostModel.store = {
        modelFor: jest.fn().mockReturnValue(CommentModel)
      }

      // When
      Registry.registerModel(PostModel)

      // Then
      expect(PostModel.definition.relationships).toEqual({
        comments: {type: 'hasMany', modelFrom: PostModel.modelName, keyFrom: 'id', modelTo: CommentModel.modelName, keyTo: 'customId'}
      })
    })

    test('relationship name for multiword model name', () => {
      // Given
      class MyPostModel extends Model {
        static relationships (relation) {
          relation('hasMany', 'my-custom-comment')
        }
      }
      class MyCustomCommentModel extends Model {}
      MyPostModel.store = {
        modelFor: jest.fn().mockReturnValue(MyCustomCommentModel)
      }

      // When
      Registry.registerModel(MyPostModel)

      // Then
      expect(MyPostModel.definition.relationships).toEqual({
        myCustomComments: {type: 'hasMany', modelFrom: MyPostModel.modelName, keyFrom: 'id', modelTo: MyCustomCommentModel.modelName, keyTo: 'myPostId'}
      })
    })

    test('model with included data relationship hasMany getter called', async () => {
      // Given
      class PostModel extends Model {
        static relationships (relation) {
          relation('hasMany', 'comment')
        }
      }
      class CommentModel extends Model {}
      PostModel.store = {
        modelFor: jest.fn().mockReturnValue(CommentModel),
        adapterFor: jest.fn().mockReturnValue(class Adapter {})
      }

      // When
      Registry.registerModel(PostModel)
      const model = new PostModel({comments: [{}, {}]})
      const comments = await model.comments

      // Then
      expect(comments.length).toEqual(2)
      expect(comments[0].constructor.name).toEqual('CommentModel')
    })

    test('model with included data relationship belongsTo getter called', async () => {
      // Given
      class PostModel extends Model {
        static relationships (relation) {
          relation('belongsTo', 'author')
        }
      }
      class AuthorModel extends Model {}
      PostModel.store = {
        modelFor: jest.fn().mockReturnValue(AuthorModel),
        adapterFor: jest.fn().mockReturnValue(class Adapter {})
      }

      // When
      Registry.registerModel(PostModel)
      const model = new PostModel({author: {}})
      const author = await model.author

      // Then
      expect(author.constructor.name).toEqual('AuthorModel')
    })
  })
})
