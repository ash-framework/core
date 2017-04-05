import { pluralize, singularize, dasherize, underscore } from 'inflection'

export function dasherize (input: string) {
  const classNameUnderscored = underscore(input)
  return dasherize(classNameUnderscored)
}
