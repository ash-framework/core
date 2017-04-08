/* global describe, it, expect, jest */

import {
  dasherize,
  runMiddleware,
  runInitializers,
  isReadableStream
} from '../lib/classes/utils'
import Middleware from '../lib/classes/middleware'
import Initializer from '../lib/classes/initializer'
import { registry, container } from '../lib/classes/di'
import { Readable } from 'stream'

container._resolver = null

describe('module utils', () => {
  describe('isReadableStream', () => {
    it('should correctly determine if an object is a readable stream', () => {
      // Given
      const subject = new Readable()

      // When
      const checked = isReadableStream(subject)

      // Then
      expect(checked).toBe(true)
    })
  })

  describe('dasherize', () => {
    it('should dasherize a camelCased string', () => {
      // Given
      const subject = 'myCamelString'

      // When
      const transformed = dasherize(subject)

      // Then
      expect(transformed).toBe('my-camel-string')
    })

    it('should dasherize upper camelCased string', () => {
      // Given
      const subject = 'MyCamelString'

      // When
      const transformed = dasherize(subject)

      // Then
      expect(transformed).toBe('my-camel-string')
    })

    it('should not dasherize lowercase string', () => {
      // Given
      const subject = 'mylowercasestring'

      // When
      const transformed = dasherize(subject)

      // Then
      expect(transformed).toBe('mylowercasestring')
    })

    it('should not change dasherized string', () => {
      // Given
      const subject = 'my-lower-case-string'

      // When
      const transformed = dasherize(subject)

      // Then
      expect(transformed).toBe('my-lower-case-string')
    })
  })

  describe('runMiddleware', () => {
    it('should run ok given an empty middleware array', async () => {
      // Given
      const middlewareList = []

      // When
      const run = await runMiddleware(middlewareList, {}, {})

      // Then
      return expect(run).toBeFalsy()
    })

    it('should load and run all middleware in order', async () => {
      // Given
      const middlewareList = ['middleware-1', 'middleware-2', 'middleware-3']
      const middlewareMock = jest.fn()
      class Middleware1 extends Middleware {
        register () {
          middlewareMock(1)
        }
      }
      class Middleware2 extends Middleware {
        register () {
          middlewareMock(2)
        }
      }
      class Middleware3 extends Middleware {
        register () {
          middlewareMock(3)
        }
      }
      registry.register('middleware:middleware-1', Middleware1)
      registry.register('middleware:middleware-2', Middleware2)
      registry.register('middleware:middleware-3', Middleware3)

      // When
      await runMiddleware(middlewareList, {}, {})

      // Then
      const mockCalls = middlewareMock.mock.calls
      expect(mockCalls).toEqual([[1], [2], [3]])
    })
  })

  describe('runInitializers', () => {
    it('should run ok given an empty initializers array', async () => {
      // Given
      const initializersList = []

      // When
      const run = await runMiddleware(initializersList, {}, {})

      // Then
      return expect(run).toBeFalsy()
    })

    it('should load and run all initializers in order', async () => {
      // Given
      const initializerList = [
        'initializer-1',
        'initializer-2',
        'initializer-3'
      ]
      const initializerMock = jest.fn()
      class Initializer1 extends Initializer {
        init () {
          initializerMock(1)
        }
      }
      class Initializer2 extends Initializer {
        init () {
          initializerMock(2)
        }
      }
      class Initializer3 extends Initializer {
        init () {
          initializerMock(3)
        }
      }
      registry.register('initializer:initializer-1', Initializer1)
      registry.register('initializer:initializer-2', Initializer2)
      registry.register('initializer:initializer-3', Initializer3)

      // When
      await runInitializers(initializerList, {}, {})

      // Then
      const mockCalls = initializerMock.mock.calls
      expect(mockCalls).toEqual([[1], [2], [3]])
    })
  })
})
