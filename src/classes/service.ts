import Base from './base'
import { registry, container } from './di'

/**
  @class Service
  @extends Base
  @public
*/
export default class Service extends Base {
  static classType: string = 'service'
}

export function service(serviceName: string): Function {
  return function (target: any, property: string) {
    const proto = Object.getPrototypeOf(target.constructor)
    proto.services.push([serviceName, property])
  }
}
