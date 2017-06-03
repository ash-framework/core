import { camelCase, isPlainObject, get } from 'lodash'
import * as assert from 'assert'
import { existsSync } from 'fs'
import * as path from 'path'
import { Registry, Container } from '@glimmer/di'

const BASE_PATH = path.join(process.cwd(), 'app')

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

  parseEsModule(file: File) {
    return (file && file.__esModule) ? file.default : file
  }

  loadFileFor(path: string): File {
    if (existsSync(path)) {
      return require(path)
    }
    assert(false, `Resolver unable to resolve file at: ${path}`)
  }

  filepathFor(type: string, filename: string): string {
    if (!filename) return ''
    return path.join(BASE_PATH, TYPES[type].directory, filename) + '.ts'
  }

  filenameFor(type: string, name: string, verb?: string): string {
    if (name === 'main') return TYPES[type].main

    if (TYPES[type].verbs && verb) {
      return `${name}.${verb}`
    }

    return name
  }

  validateType(type: string) {
    assert(TYPES[type], `Type: '${type}' is not supported by the resolver.`)
  }

  validateName(name: string) {
    assert(name, `Name: '${name}' must not be empty. Invalid: 'route:' Valid: 'route:my-route'`)
  }

  validateVerb(verb: string) {
    if (!verb) return
    assert(['get', 'patch', 'post', 'delete'].includes(verb),
      `Verb: '${verb}' must be one of 'post', 'patch', 'delete', 'get'`)
  }

  fallbackFor(type: string, name: string, verb?: string): string {
    if (TYPES[type].verbs && verb === 'get') {
      return name
    }
    return TYPES[type].fallback
  }

  loadFile(type: string, filename: string) {
    const filepath = this.filepathFor(type, filename)
    return this.parseEsModule(this.loadFileFor(filepath))
  }

  retrieve(specifier: string) {
    const [type, name, verb] = specifier.split(':')

    this.validateType(type)
    this.validateName(name)
    this.validateVerb(verb)

    try {
      return this.loadFile(type, this.filenameFor(type, name, verb))
    } catch (err) {
      return this.loadFile(type, this.fallbackFor(type, name, verb))
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
