/* global describe, it, expect */

import { mixin } from '../lib/classes/mixin'

describe('module mixin', () => {
  describe('mixin decorator', () => {
    it('should decorate a basic class', () => {
      // Given
      class Behaviour {
        method () {
          return true
        }
      }

      // When
      @mixin(Behaviour)
      class Mixed {}
      const mixed = new Mixed()

      // Then
      expect(mixed.method()).toBeTruthy()
    })

    it('should decorate with multiple mixins class', () => {
      // Given
      class Behaviour1 {
        method1 () {
          return true
        }
      }
      class Behaviour2 {
        method2 () {
          return true
        }
      }

      // When
      @mixin(Behaviour1, Behaviour2)
      class Mixed {}
      const mixed = new Mixed()

      // Then
      expect(mixed.method1()).toBeTruthy()
      expect(mixed.method2()).toBeTruthy()
    })
  })
})
