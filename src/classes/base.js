'use strict'

const Inject = require('./inject')

/**
* Ash framework base class.
*
* This class is the base class for all Ash classes. It adds support for mixins in all
* child classes.
*
* @class Base
* @constructor
*/
module.exports = class Base {
  /**
   * Sets up mixins.
   *
   * When overriding the constructor, remember to call `super()`
   *
   * @method constructor
   */
  constructor () {
    Inject.mixins(this)
  }

  /**
   * Defines mixins for class.
   *
   * Gets passed a `register` function that
   * can be called to mix mixin class methods in.
   *
   * Call register multiple times to mixin multiple mixins.
   *
   * ```
   * class MyMixin1 {
   *   method1 () {}
   * }
   *
   * class MyMixin2 {
   *   method2 () {}
   * }
   *
   * class MyClass extends Ash.Base {
   *   static mixins(register) {
   *     register(MyMixin1)
   *     register(MyMixin2)
   *   }
   * }
   * ```
   *
   * Instantiating `MyClass` will result in an object with methods `method1` and `method2` mixed in.
   *
   * @method mixins
   * @static
   * @param {Function} register - mixin registration function. Can be called multiple times to register
   * additional mixins.
   */
  static mixins (register) { }
}
