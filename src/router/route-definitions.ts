import * as path from 'path'
import createCallback from './create-callback'
import { Registry, Container } from '@glimmer/di'
import { find } from 'lodash'

const SUPPORTED_METHODS: Array<string> = ['get', 'put', 'post', 'patch', 'delete', 'options', 'head']
const IMPLICIT_ROUTE_NAME = 'index'

export interface RouteObject {
  name: string
  children: Array<RouteObject>
  path: string
}

export interface RouteDefinition {
  method: string
  callback: Function
  name: string
  path: string
}

export interface RouteBranch {
  name?: string
  path: string
  children: Array<RouteDefinition | RouteBranch>
}

export class RouteDefinitions {
  container: Container

  constructor (container: Container) {
    this.container = container
  }

  static create (container: Container) {
    return new this(container)
  }

  definitionForLeaf (name: string, method: string, path: string): RouteDefinition {
    const Route = this.container.factoryFor(`route:${name}:${method.toLowerCase()}`)
    if (Route) {
      const callback = createCallback(Route, name)
      return { method, callback, name, path }
    }
  }

  defintionForBranch (path: string, children: Array<RouteObject>) {
    return {
      path: path,
      children: this.buildDefinitions(children)
    }
  }

  findMatchingChild (routeObject: RouteObject): RouteObject {
    return find(routeObject.children, ['name', routeObject.name])
  }

  hasMatchingChild (routeObject: RouteObject): boolean {
    const matchingChild: RouteObject = this.findMatchingChild(routeObject)
    return matchingChild.path === '/'
  }

  hasChildren (routeObject: RouteObject): boolean {
    return routeObject.children.length > 0
  }

  isImplicitRoute (routeObject: RouteObject): boolean {
    return routeObject.name === IMPLICIT_ROUTE_NAME
  }

  buildDefinitions (routeObjects: Array<RouteObject>): Array<RouteDefinition | RouteBranch> {
    const definitions: Array<RouteDefinition | RouteBranch> = []
    for (const routeObj of routeObjects) {
      if (this.isImplicitRoute(routeObj)) continue

      if (this.hasChildren(routeObj)) {
        if (!this.hasMatchingChild(routeObj)) {
          // implicit routes
          for (const method of SUPPORTED_METHODS) {
            const routeDefinition = this.definitionForLeaf(IMPLICIT_ROUTE_NAME, method, routeObj.path)
            if (routeDefinition) definitions.push(routeDefinition)
          }
        }

        definitions.push(this.defintionForBranch(routeObj.path, routeObj.children))
      } else {
        // explicit routes
        for (const method of SUPPORTED_METHODS) {
          const routeDefinition = this.definitionForLeaf(routeObj.name, method, routeObj.path)
          if (routeDefinition) definitions.push(routeDefinition)
        }
      }
    }
    return definitions
  }
}
