import Base from './base'

/**
  @class Router
  @extends Base
  @public
*/
export default class Router extends Base {
  static classType: string = 'router'
  static definition: Function

  /**
    @method map
    @static
    @public
    @param {Object} definition
  */
  static map(definition: Function) {
    this.definition = definition
  }
}
