import Base from './base'

/**
  @class Router
  @extends Base
  @public
*/
export default class Router extends Base {
  static definition: any

  /**
    @method map
    @static
    @public
    @param {Object} definition
  */
  static map(definition: any) {
    this.definition = definition
  }
}
