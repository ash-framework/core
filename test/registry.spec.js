/* global describe, it, expect */

import { registry, container } from '../lib/classes/di'

describe('module di', () => {
  describe('registering classes', () => {
    it('should register a basic class', () => {
      // Given
      class MyClass {
        static create () {
          return new this()
        }
        method () {
          return true
        }
      }

      // When
      registry.register('route', MyClass)
      const myClass = container.lookup('route')

      // Then
      expect(myClass.method()).toBeTruthy()
    })

    it('dependency injection', () => {
      // Given
      class MyClass {
        static create (options) {
          const instance = new this()
          Object.assign(this, options)
          return instance
        }
      }
      class MyInjection {
        static create (options) {
          const instance = new this()
          Object.assign(this, options)
          return instance
        }

        method () {
          return true
        }
      }

      // When
      registry.register('route', MyClass)
      registry.register('service', MyInjection)
      registry.registerInjection('route', 'method', 'service')
      const myClass = container.lookup('route')

      // Then
      expect(myClass.method()).toBeTruthy()
    })
  })
})
