/* global describe, it, expect */

import Middleware, { middleware } from '../lib/classes/middleware'
import Route from '../lib/classes/route'

describe('module middleware', () => {
  describe('middleware decorator', () => {
    it('should define middleware names list on a class', () => {
      // Given
      class MyMiddleware extends Middleware {
        register (request, response) {}
      }

      // When
      @middleware('my-middleware')
      class MyRoute extends Route {}

      // Then
      expect(MyRoute.middleware[0]).toBe('my-middleware')
    })
  })
})
