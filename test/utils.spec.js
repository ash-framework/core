import { dasherize } from '../lib/classes/utils'

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
})
