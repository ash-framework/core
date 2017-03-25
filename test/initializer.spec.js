/* global describe, it, expect */
const Subject = require('../src/classes/initializer')

describe('initializer', () => {
  test('.init method exits on base class', () => {
    // when
    const initializer = new Subject()

    // then
    expect(typeof initializer.init).toBe('function')
  })

  test('extending class must override init', () => {
    // given
    class Override extends Subject {}

    // when
    const instance = new Override()

    // then
    expect(instance.init).toThrow()
  })
})
