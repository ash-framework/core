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
      registry.register('my-class', MyClass)
      const myClass = container.lookup('my-class')

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
        method () {
          return true
        }
      }

      // When
      registry.register('my-class', MyClass)
      registry.register('my-injection', MyInjection)
      registry.registerInjection('my-class', 'method', 'my-injection')
      const myClass = container.lookup('my-class')

      // Then
      expect(myClass.method()).toBeTruthy()
    })
  })
})
