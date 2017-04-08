/* global describe, it, expect */

import { service } from '../lib/classes/service'
import { registry, container } from '../lib/classes/di'
import Base from '../lib/classes/base'

container._resolver = null

describe('module service', () => {
  describe('service decorator', () => {
    it('should decorate a basic class', () => {
      // Given
      class Service extends Base {}
      class MyService extends Service {
        method () {
          return true
        }
      }
      registry.register('service:my-service', MyService, {
        singleton: true
      })

      // When
      class Route extends Base {}
      class MyRoute extends Route {
        @service('my-service')
        myService = null;
      }
      registry.register('route:my-route', MyRoute)
      const myRoute = container.lookup('route:my-route')

      // Then
      expect(myRoute.myService.method()).toBeTruthy()
    })
  })
})
