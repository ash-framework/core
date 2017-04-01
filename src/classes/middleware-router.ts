import Base from './base'

/**
  @class MiddlewareRouter
  @extends Base
  @constructor
*/
export default class MiddlewareRouter extends Base {
  static definition: any

  /**
    @method map
    @static
    @param {Object} definition
  */
  static map (definition: any) {
    this.definition = definition
  }
}
