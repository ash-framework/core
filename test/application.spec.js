/* global describe, it, expect */

import Middleware, { middleware } from '../lib/classes/middleware'
import Initializer, { initializer } from '../lib/classes/initializer'
import Application from '../lib/classes/application'
import { container, registry } from '../lib/classes/di'

container._resolver = null

describe('module application', () => {
  describe('initializer decorator', () => {
    it('should define initializers property statically on application class', () => {
      // When
      @initializer('my-initializer1', 'my-initializer2')
      class MyApplication extends Application {}

      // Then
      expect(MyApplication.initializers).toEqual([
        'my-initializer1',
        'my-initializer2'
      ])
    })
  })

  describe('middleware decorator', () => {
    it('should decorate application startup with specified middleware', () => {
      // When
      @middleware('my-middleware1', 'my-middleware2')
      class MyApplication extends Application {}

      // Then
      expect(MyApplication.middleware).toEqual([
        'my-middleware1',
        'my-middleware2'
      ])
    })
  })
})
