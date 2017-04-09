import Base from './base'

/**
  @class Mixin
  @extends Base
  @constructor
*/
export default class Mixin extends Base {
  static classType: string = 'mixin'
}

export function mixin(...classes: Array<any>) {
  const behaviours = new Map()
  for (const cls of classes) {
    for (const key of Reflect.ownKeys(cls.prototype)) {
      behaviours.set(key, cls.prototype[key])
    }
  }

  function _mixin(clazz) {
    for (const [property, behaviour] of behaviours) {
      Object.defineProperty(clazz.prototype, property, {
        value: behaviour,
        writable: true
      })
    }
    return clazz
  }

  return _mixin
}

