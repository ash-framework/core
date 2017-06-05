import * as path from 'path'
import createCallback from './create-callback'
import { Registry, Container } from '@glimmer/di'
import { find } from 'lodash'

const SUPPORTED_METHODS: Array<string> = ['get', 'put', 'post', 'patch', 'delete', 'options', 'head']
const IMPLICIT_ROUTE_NAME: string = 'index'

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
  /**
   * @property {Container} container
   * @private
   */
  container: Container

  /**
   * @constructor
   * @param container
   */
  constructor (container: Container) {
    this.container = container
  }

  /**
   * @static
   * @param {Container} container
   * @return {RouteDefinitions}
   */
  static create (container: Container) {
    return new this(container)
  }

  /**
   * Produces a route definition for a route object with no children
   * (which is therefore considered a leaf rather than a branch)
   * @param {String} name
   * @param {String} method
   * @param {String} path
   * @return {RouteDefinition}
   */
  definitionForLeaf (name: string, method: string, path: string): RouteDefinition {
    const Route = this.container.factoryFor(`route:${name}:${method.toLowerCase()}`)
    if (Route) {
      const callback = createCallback(Route, name)
      return { method, callback, name, path }
    }
  }

  /**
   * Produces a route definition for a route object with children
   * (which is threrfore considered a branch rather than a leaf)
   * @param {String} path
   * @param {RouteObject[]} children
   * @return {RouteBranch}
   */
  defintionForBranch (name: string, path: string, children: Array<RouteObject>): RouteBranch {
    return {
      path,
      children: this.buildDefinitions(name, children)
    }
  }

  /**
   * Finds a route object in the given route objects immediate children matched by
   * name if one exists.
   * @param {RouteObject} routeObject
   * @return {RouteObject}
   */
  findMatchingChild (routeObject: RouteObject): RouteObject {
    return find(routeObject.children, ['name', routeObject.name])
  }

  /**
   * Determines if a given route object has a child route object that shares
   * both the same name and route path
   * @param {RouteObject} routeObject
   * @return {boolean}
   */
  hasMatchingChild (routeObject: RouteObject): boolean {
    const matchingChild: RouteObject = this.findMatchingChild(routeObject)
    return matchingChild && matchingChild.path === '/'
  }

  /**
   * Determines if the given route object has children
   * @param {RouteObject} routeObject
   * @return {boolean}
   */
  hasChildren (routeObject: RouteObject): boolean {
    return routeObject.children.length > 0
  }

  /**
   * Determines if the given route object's name property matches
   * the IMPLICIT_ROUTE_NAME. Route objects that match are not of
   * interest to Ash
   * @param {RouteObject} routeObject
   * @return {boolean}
   */
  isImplicitRoute (routeObject: RouteObject): boolean {
    return routeObject.name === IMPLICIT_ROUTE_NAME
  }

  /**
   * Produces a definition array suitable to be used with:
   * https://www.npmjs.com/package/express-object-defined-routes
   * from an array of route objects produced by
   * https://www.npmjs.com/package/ember-route-objects
   * @param {RouteObject[]} routeObject
   * @return {Array<RouteDefinition | RouteBranch>}
   */
  buildDefinitions (name: string = '', routeObjects: Array<RouteObject>): Array<RouteDefinition | RouteBranch> {
    const definitions: Array<RouteDefinition | RouteBranch> = []
    for (const routeObj of routeObjects) {
      if (this.isImplicitRoute(routeObj)) continue

      if (this.hasChildren(routeObj)) {
        if (!this.hasMatchingChild(routeObj)) {
          // implicit routes
          for (const method of SUPPORTED_METHODS) {
            const routeDefinition = this.definitionForLeaf(path.join(routeObj.name, IMPLICIT_ROUTE_NAME), method, routeObj.path)
            if (routeDefinition) definitions.push(routeDefinition)
          }
        }

        definitions.push(this.defintionForBranch(path.join(name, routeObj.name), routeObj.path, routeObj.children))
      } else {
        // explicit routes
        for (const method of SUPPORTED_METHODS) {
          const routeDefinition = this.definitionForLeaf(path.join(name, routeObj.name), method, routeObj.path)
          if (routeDefinition) definitions.push(routeDefinition)
        }
      }
    }
    return definitions
  }
}
