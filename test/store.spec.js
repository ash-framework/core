/* global describe, it, jest, expect */
let Subject, classResolverMock, registryMock
Subject = require('../src/classes/store')

jest.mock('../src/classes/class-resolver', () => {
  class MockClassResolver {}
  MockClassResolver.resolve = classResolverMock = jest.fn().mockReturnValue(class MockClass {})
  return MockClassResolver
})

jest.mock('../src/classes/registry', () => {
  class MockRegistry {}
  MockRegistry.models = { get: registryMock = jest.fn(), has: () => true, keys: () => [] }
  return MockRegistry
})

describe('store', () => {
  describe('adapterFor', () => {
    it('should throw if string not given', () => {
      // When
      const store = new Subject()

      // Then
      expect(store.adapterFor).toThrow('First argument to store.adapterFor must be a string')
    })

    it('should return adapter for a given model name', () => {
      // When
      const store = new Subject()
      store.adapterFor('post')

      // Then
      expect(classResolverMock).toHaveBeenCalledWith('adapter', 'post')
    })
  })

  describe('serializerFor', () => {
    it('should throw if string not given', () => {
      // When
      const store = new Subject()

      // Then
      expect(store.serializerFor).toThrow('First argument to store.serializerFor must be a string')
    })

    it('should return serializer for a given model name', () => {
      // When
      const store = new Subject()
      store.serializerFor('post')

      // Then
      expect(classResolverMock).toHaveBeenCalledWith('serializer', 'post')
    })
  })

  describe('modelFor', () => {
    it('should throw if string not given', () => {
      // When
      const store = new Subject()

      // Then
      expect(store.modelFor).toThrow('First argument to store.modelFor must be a string')
    })

    it('should return model for a given model name', () => {
      // When
      const store = new Subject()
      store.modelFor('post')

      // Then
      expect(registryMock).toHaveBeenCalledWith('post')
    })
  })

  describe('findAll', () => {
    it('should throw if string not given', () => {
      // When
      const store = new Subject()

      // Then
      expect(store.findAll).toThrow('First argument to store.findAll must be a string')
    })
  })

  describe('query', () => {
    it('should throw if string not given', () => {
      // When
      const store = new Subject()

      // Then
      expect(store.query).toThrow('First argument to store.query must be a string')
    })

    it('should throw if options is given and not an object', () => {
      // When
      const store = new Subject()
      const query = () => store.query('asd', 1)

      // Then
      expect(query).toThrow('Second (optional) argument, "options" to "store.query" must be an object when given')
    })
  })

  describe('findRecord', () => {
    it('should throw if first argument "modelName" (string) not given', () => {
      // When
      const store = new Subject()

      // Then
      expect(store.findRecord).toThrow('First argument to store.findRecord must be a string')
    })

    it('should throw if second argument "id" (string|number) not given', () => {
      // When
      const store = new Subject()
      const findRecord = () => store.findRecord('asd')

      // Then
      expect(findRecord).toThrow('Second argument to store.findRecord "id" must be a number or numeric string')
    })

    it('should throw if options is given and not an object', () => {
      // When
      const store = new Subject()
      const findRecord = () => store.findRecord('asd', 1, 1)

      // Then
      expect(findRecord).toThrow('Third (optional) argument, "options" to "store.findRecord" must be an object when given')
    })
  })

  describe('queryRecord', () => {
    it('should throw if string not given', () => {
      // When
      const store = new Subject()

      // Then
      expect(store.queryRecord).toThrow('First argument to store.queryRecord must be a string')
    })

    it('should throw if options is given and not an object', () => {
      // When
      const store = new Subject()
      const queryRecord = () => store.queryRecord('asd', 1)

      // Then
      expect(queryRecord).toThrow('Second (optional) argument, "options" to "store.queryRecord" must be an object when given')
    })
  })

  describe('createRecord', () => {
    it('should throw if string not given', () => {
      // When
      const store = new Subject()

      // Then
      expect(store.createRecord).toThrow('First argument to store.createRecord must be a string')
    })

    it('should throw if data is not an object', () => {
      // When
      const store = new Subject()
      const createRecord = () => store.createRecord('asd', 1)

      // Then
      expect(createRecord).toThrow('Second argument, "data" to "store.createRecord" must be an object')
    })
  })

  describe('updateRecord', () => {
    it('should throw if string not given', () => {
      // When
      const store = new Subject()

      // Then
      expect(store.updateRecord).toThrow('First argument to store.updateRecord must be a string')
    })

    it('should throw if second argument "id" (string|number) not given', () => {
      // When
      const store = new Subject()
      const updateRecord = () => store.updateRecord('asd')

      // Then
      expect(updateRecord).toThrow('Second argument to store.updateRecord "id" must be a number or numeric string')
    })

    it('should throw if data is not an object', () => {
      // When
      const store = new Subject()
      const updateRecord = () => store.updateRecord('asd', 1)

      // Then
      expect(updateRecord).toThrow('Third argument, "data" to "store.updateRecord" must be an object')
    })
  })

  describe('deleteRecord', () => {
    it('should throw if string not given', () => {
      // When
      const store = new Subject()

      // Then
      expect(store.deleteRecord).toThrow('First argument to store.deleteRecord must be a string')
    })

    it('should throw if second argument "id" (string|number) not given', () => {
      // When
      const store = new Subject()
      const deleteRecord = () => store.deleteRecord('asd')

      // Then
      expect(deleteRecord).toThrow('Second argument to store.deleteRecord "id" must be a number or numeric string')
    })
  })
})
