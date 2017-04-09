/* global describe, it, expect */

import Service, { service } from '../lib/classes/service'
import { registry, container } from '../lib/classes/di'
import Base from '../lib/classes/base'
import Route from '../lib/classes/route'
import { injectServices } from '../lib/classes/utils'

container._resolver = null

describe('module service', () => {
  describe('service decorator', () => {
    it('should define services to be injected', () => {
      // Given/When
      class MyClass extends Route {
        @service('my-service1')
        myService1 = null;
        @service('my-service2')
        myService2 = null;
      }

      // Then
      expect(MyClass.services).toEqual([
        ['my-service1', 'myService1'],
        ['my-service2', 'myService2']
      ])
    })

    it('should decorate a basic class', () => {
      // Given
      class MyService extends Service {
        method () {
          return true
        }
      }
      registry.register('service:my-service', MyService)
      class MyRoute extends Route {
        @service('my-service')
        myService = null;
      }

      // When
      const myRoute = MyRoute.create({ request: {}, response: {} })
      injectServices(myRoute, MyRoute.services)

      // Then
      expect(myRoute.myService.method()).toBeTruthy()
    })
  })
})
