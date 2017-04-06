import Base from './base'
import { registry } from './di'
import { dasherize } from './utils'

/**
  @class Service
  @extends Base
  @public
*/
export default class Service extends Base {

}

export function service (serviceName: string): Function {
  return function (target: any, property: string) {
    const parentClassName = dasherize(Object.getPrototypeOf(target.constructor).name)
    const className = dasherize(target.constructor.name)

    registry.registerInjection(`${parentClassName}:${className}`, property, `service:${serviceName}`)
  }
}
