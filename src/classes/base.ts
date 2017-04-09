/**
  Ash framework base class.
  This class is the base class for all Ash classes.
  It adds support for mixins in all child classes.

  @class Base
  @public
*/
export default class Base {
  static classType: string = 'base'
  static services: Array<Array<string>> = []

  /**
    Sets up mixins.
    When overriding the constructor, remember to call `super()`

    @method constructor
    @public
    @constructor
  */
  constructor(options: object) { }

  static create(options: object) {
    const instance = new this(options)
    Object.assign(instance, options)
    return instance
  }
}
