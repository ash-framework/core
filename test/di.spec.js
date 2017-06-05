/* global test, expect, afterEach */

import { resolver } from '../lib/classes/di'
import * as td from 'testdouble'

afterEach(() => td.reset())

test('.parseEsModule() with es module file object', () => {
  const file = {
    __esModule: true,
    default: {
      name: 'module'
    }
  }

  const result = resolver.parseEsModule(file)

  expect(result.name).toBe('module')
})

test('.parseEsModule() without es module file object', () => {
  const file = { name: 'module' }

  const result = resolver.parseEsModule(file)

  expect(result.name).toBe('module')
})

test('.filepathFor()', () => {
  const type = 'route'
  const filename = 'welcome'

  const result = resolver.filepathFor(type, filename)

  expect(result).toMatch('app/routes/welcome.ts')
})

test('.filepathFor() complex path', () => {
  const type = 'route'
  const filename = 'posts/comments'

  const result = resolver.filepathFor(type, filename)

  expect(result).toMatch('app/routes/posts/comments.ts')
})

test('.filenameFor() posts route', () => {
  const type = 'route'
  const name = 'posts'

  const result = resolver.filenameFor(type, name)

  expect(result).toBe('posts')
})

test('.filenameFor() posts route with get verb', () => {
  const type = 'route'
  const name = 'posts'
  const verb = 'get'

  const result = resolver.filenameFor(type, name, verb)

  expect(result).toBe('posts.get')
})

test('.filenameFor() posts route with patch verb', () => {
  const type = 'route'
  const name = 'posts'
  const verb = 'patch'

  const result = resolver.filenameFor(type, name, verb)

  expect(result).toBe('posts.patch')
})

test('.filenameFor() middleware main identifier', () => {
  const type = 'middleware'
  const name = 'main'

  const result = resolver.filenameFor(type, name)

  expect(result).toBe('application')
})

test('.filenameFor() router main identifier', () => {
  const type = 'router'
  const name = 'main'

  const result = resolver.filenameFor(type, name)

  expect(result).toBe('router')
})

test('.fallbackFor() router', () => {
  const type = 'router'

  const result = resolver.fallbackFor(type)

  expect(result).toBe('router')
})

test('.fallbackFor() route.get', () => {
  const type = 'route'
  const name = 'posts'
  const verb = 'get'

  const result = resolver.fallbackFor(type, name, verb)

  expect(result).toBe('posts')
})

test('.fallbackFor() service', () => {
  const type = 'service'
  const name = 'auth'

  const result = resolver.fallbackFor(type, name)

  expect(result).toBeFalsy()
})

test('.fallbackFor() route.patch', () => {
  const type = 'route'
  const name = 'posts'
  const verb = 'patch'

  const result = resolver.fallbackFor(type, name, verb)

  expect(result).toBeFalsy()
})

test('.retrieve() non es2015 module', () => {
  const loadFileFor = td.replace(resolver, 'loadFileFor')
  td.when(loadFileFor(
    td.matchers.anything()
  )).thenReturn({name: 'module'})

  const result = resolver.retrieve('route:post')

  expect(result.name).toBe('module')
})

test('.retrieve() es2015 module', () => {
  const loadFileFor = td.replace(resolver, 'loadFileFor')
  td.when(loadFileFor(
    td.matchers.anything()
  )).thenReturn({__esModule: true, default: {name: 'module'}})

  const result = resolver.retrieve('route:post')

  expect(result.name).toBe('module')
})

test('.retrieve() throws error for incorrect types', () => {
  expect(() => resolver.retrieve('fake:thing')).toThrow()
})

test('.retrieve() fallback tried if first call to loadFileFor throws', () => {
  const loadFileFor = td.replace(resolver, 'loadFileFor')
  td.when(loadFileFor(td.matchers.anything()), {times: 1})
    .thenThrow(new Error('boom!'))
  const fallbackFor = td.replace(resolver, 'fallbackFor')

  resolver.retrieve('router:fake')

  td.verify(fallbackFor('router', 'fake', undefined))
})

test('.validateType()', () => {
  const input = 'fake'

  expect(() => resolver.validateType(input)).toThrow()
})

test('.validateName()', () => {
  const input = ''

  expect(() => resolver.validateName(input)).toThrow()
})

test('.validateVerb() empty is ok', () => {
  const input = ''

  const result = resolver.validateVerb(input)

  expect(result).toBeFalsy()
})

test('.validateVerb() get is ok', () => {
  const input = 'get'

  const result = resolver.validateVerb(input)

  expect(result).toBeFalsy()
})

test('.validateVerb() patch is ok', () => {
  const input = 'patch'

  const result = resolver.validateVerb(input)

  expect(result).toBeFalsy()
})

test('.validateVerb() post is ok', () => {
  const input = 'post'

  const result = resolver.validateVerb(input)

  expect(result).toBeFalsy()
})

test('.validateVerb() delete is ok', () => {
  const input = 'delete'

  const result = resolver.validateVerb(input)

  expect(result).toBeFalsy()
})

test('.validateVerb() bad input', () => {
  const input = 'fake'

  expect(() => resolver.validateVerb(input)).toThrow()
})

