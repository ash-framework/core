/* global describe, it, expect, afterEach */

import { registry, container, resolver } from '../lib/classes/di'
import * as td from 'testdouble'

afterEach(() => td.reset())

describe('module di', () => {
  describe('registering classes', () => {
    it('should register a basic class', () => {
      class MyClass {
        static create () {
          return new this()
        }
        method () {
          return true
        }
      }
      const loadFileFor = td.replace(resolver, 'loadFileFor')
      td.when(loadFileFor(
        td.matchers.anything()
      )).thenReturn(MyClass)

      registry.register('route:my-class', MyClass)
      const myClass = container.lookup('route:my-class')

      expect(myClass.method()).toBeTruthy()
    })

    it('dependency injection', () => {
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
      const loadFileFor = td.replace(resolver, 'loadFileFor')
      td.when(loadFileFor(
        td.matchers.anything()
      )).thenReturn(MyClass, MyInjection)

      registry.register('route:my-class', MyClass)
      registry.register('service:my-injection', MyInjection)
      registry.registerInjection('route:my-class', 'method', 'service:my-injection')
      const myClass = container.lookup('route:my-class')

      expect(myClass.method()).toBeTruthy()
    })
  })
})
