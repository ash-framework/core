import { camelCase, isPlainObject, get } from 'lodash'
import * as assert from 'assert'
import { existsSync } from 'fs'
import * as path from 'path'
import { Registry, Container } from '@glimmer/di'

const BASE_PATH = path.join(process.cwd(), 'app')
const EXT = '.ts'
const SUPPORTED_VERBS: Array<string> = ['get', 'put', 'post', 'patch', 'delete', 'options', 'head']

const TYPES = Object.freeze({
  route: {
    verbs: true,
    directory: 'routes',
    main: 'application'
  },
  router: {
    directory: '',
    main: 'router',
    fallback: 'router'
  },
  middleware: {
    directory: 'middleware',
    main: 'application',
    fallback: 'application'
  },
  initializer: {
    directory: 'initializers',
    main: 'application',
    fallback: 'application'
  },
  service: {
    directory: 'services',
    main: 'application'
  }
})

export interface File {
  __esModule?: boolean, default?: any
}

export class Resolver {
  identify: any

  /**
   * Determines if a given required file was an es2015 module and
   * handles it accordingly
   * @param {Mixed} file
   * @return {Mixed}
   */
  parseEsModule(file: File) {
    return (file && file.__esModule) ? file.default : file
  }

  /**
   * Loads file at a given path. Throws if file is not found.
   * @param {String} path
   * @throws {Error}
   * @return {Mixed}
   */
  loadFileFor(path: string): File {
    if (existsSync(path)) {
      return require(path)
    }
    assert(false, `Resolver unable to resolve file at: ${path}`)
  }

  /**
   * Constructs and returns a filepath for a given class type and
   * filename. Returns an empty string if a path could not be constructed.
   * @param {String} type
   * @param {String} filename
   * @return {String}
   */
  filepathFor(type: string, filename: string): string {
    if (!filename) return ''
    return path.join(BASE_PATH, TYPES[type].directory, filename) + EXT
  }

  /**
   * Constructs and returns a filename for a given class type,
   * name identifier and optional verb (get, patch, post, delete)
   * @param {String} type
   * @param {String} name
   * @param {String} verb (optional)
   * @return {String}
   */
  filenameFor(type: string, name: string, verb?: string): string {
    if (name === 'main') return TYPES[type].main

    if (TYPES[type].verbs && verb) {
      return `${name}.${verb}`
    }

    return name
  }

  /**
   * Validates the 'type' component of a specifier string
   * @param {String} type
   * @throws {Error}
   */
  validateType(type: string) {
    assert(TYPES[type], `Type: '${type}' is not supported by the resolver.`)
  }

  /**
   * Validates the 'name' component of a specifier string
   * @param {String} name
   * @throws {Error}
   */
  validateName(name: string) {
    assert(name, `Name: '${name}' must not be empty. Invalid: 'route:' Valid: 'route:my-route'`)
  }

  /**
   * Validates the 'verb' component of a specifier string
   * @param {String} verb
   * @throws {Error}
   */
  validateVerb(verb: string) {
    if (!verb) return
    assert(SUPPORTED_VERBS.includes(verb),
      `Verb: '${verb}' must be one of 'post', 'patch', 'delete', 'get'`)
  }

  /**
   * Looks up and returns fallback filename for a given 'type', 'name', 'verb'
   * identifier
   * @param {String} type
   * @param {String} name
   * @param {String} verb
   * @return {String}
   */
  fallbackFor(type: string, name: string, verb?: string): string {
    if (TYPES[type].verbs && verb === 'get') {
      return name
    }
    return TYPES[type].fallback
  }

  /**
   * Attempts to load a file from disk using 'type' and 'filename'
   * @param {String} type
   * @param {String} filename
   * @return {Mixed}
   */
  loadFile(type: string, filename: string) {
    const filepath = this.filepathFor(type, filename)
    return this.parseEsModule(this.loadFileFor(filepath))
  }

  /**
   * Accepts a specifier and uses it to load files from disk.
   * Specifiers are : separated of the form type:name:verb.
   * 'type' refers to a class type such as 'route' or 'service'
   * 'verb' refers to an http verb and is optional.
   * Specifiers get translated into paths on the file system
   * @example
   * ```
   * route:posts:get -> app/routes/posts.get.ts
   * router:main -> app/router.ts
   * service:user -> app/services/user.ts
   * ```
   * @param {String} specifier
   */
  retrieve(specifier: string) {
    const [type, name, verb] = specifier.split(':')

    this.validateType(type)
    this.validateName(name)
    this.validateVerb(verb)

    try {
      return this.loadFile(type, this.filenameFor(type, name, verb))
    } catch (err) {
      try {
        return this.loadFile(type, this.fallbackFor(type, name, verb))
      } catch (err) {
        // Only throw if a fallback file was specified.
        // Anything else should fall through with empty return
        if (TYPES[type].fallback) throw err
      }
    }
  }
}

const registry = new Registry()
const resolver = new Resolver()
const container = new Container(registry, resolver)

registry.registerOption('service', 'singleton', true)
registry.registerOption('mixin', 'singleton', false)
registry.registerOption('route', 'singleton', false)
registry.registerOption('middleware', 'singleton', false)
registry.registerOption('router', 'singleton', true)
registry.registerOption('initializer', 'singleton', true)

export { registry, Registry, container, Container, resolver }
