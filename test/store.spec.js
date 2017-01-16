/* global describe, it, beforeEach, jest, expect */
let Subject, classResolverMock, registryMock

jest.mock('../src/classes/class-resolver', () => {
  class MockClassResolver {}
  MockClassResolver.resolve = classResolverMock = jest.fn()
  return MockClassResolver
})

jest.mock('../src/classes/registry', () => {
  class MockRegistry {}
  MockRegistry.models = { get: registryMock = jest.fn() }
  return MockRegistry
})

describe('store', () => {
  beforeEach(() => {
    Subject = require('../src/classes/store')
  })

  describe('adapterFor', () => {
    it('should return adapter for a given model name', () => {
      // When
      const store = new Subject()
      store.adapterFor('post')

      // Then
      expect(classResolverMock).toHaveBeenCalledWith('adapter', 'post')
    })
  })

  describe('serializerFor', () => {
    it('should return serializer for a given model name', () => {
      // When
      const store = new Subject()
      store.serializerFor('post')

      // Then
      expect(classResolverMock).toHaveBeenCalledWith('serializer', 'post')
    })
  })

  describe('modelFor', () => {
    it('should return model for a given model name', () => {
      // When
      const store = new Subject()
      store.modelFor('post')

      // Then
      expect(registryMock).toHaveBeenCalledWith('post')
    })
  })
})
