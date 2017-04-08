/* global describe, it, expect, jest */

import {
  dasherize,
  runMiddleware,
  runInitializers
} from '../lib/classes/utils'
import Middleware from '../lib/classes/middleware'
import Initializer from '../lib/classes/initializer'
import { registry, container } from '../lib/classes/di'

container._resolver = null

describe('module utils', () => {
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
    it('should load and run all middleware in order', () => {
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

      // When
      registry.register('middleware:middleware-1', Middleware1)
      registry.register('middleware:middleware-2', Middleware2)
      registry.register('middleware:middleware-3', Middleware3)

      return runMiddleware(middlewareList, {}, {}).then(() => {
        // Then
        const mockCalls = middlewareMock.mock.calls
        expect(mockCalls).toEqual([[1], [2], [3]])
      })
    })
  })

  describe('runInitializers', () => {
    it('should load and run all initializers in order', () => {
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

      // When
      registry.register('initializer:initializer-1', Initializer1)
      registry.register('initializer:initializer-2', Initializer2)
      registry.register('initializer:initializer-3', Initializer3)

      return runInitializers(initializerList, {}, {}).then(() => {
        // Then
        const mockCalls = initializerMock.mock.calls
        expect(mockCalls).toEqual([[1], [2], [3]])
      })
    })
  })
})
