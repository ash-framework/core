import * as path from 'path'
import createCallback from './create-callback'
import loadFile from './load-file'
import fileExists from './file-exists'
import { Registry, Container } from '@glimmer/di'

const allowedMethods: Array<string> = ['get', 'put', 'post', 'patch', 'delete', 'options', 'head']

export interface RouteObject {
  name: string
  children: Array<RouteObject>
  path: string
}

export interface RouteObjectWithCallback {
  method: string
  callback: Function
  name: string
  path: string
}

export interface Options {
  container: Container
}

export default function addRouteCallbacks(routeObjects: Array<RouteObject>, options: Options): Array<RouteObjectWithCallback> {
  const container = options.container
  const objects = []
  routeObjects.forEach(routeObj => {
    if (routeObj.name === 'index') return

    if (routeObj.children.length > 0) {
      const sameNamedChild = routeObj.children.filter(children => children.name === routeObj.name)[0]
      if (!sameNamedChild || (sameNamedChild && sameNamedChild.path !== '/')) {
        // implicit routes
        allowedMethods.forEach(method => {
          let Route = container.factoryFor(`route:index:${method.toLowerCase()}`)
          if (Route) {
            objects.push({
              method: method,
              callback: createCallback(Route, routeObj.name),
              name: 'index',
              path: routeObj.path
            })
          }
        })
      }
      objects.push({
        path: routeObj.path,
        children: addRouteCallbacks(routeObj.children, { container })
      })
    } else {
      // explicit routes
      allowedMethods.forEach(method => {
        let Route = container.factoryFor(`route:${routeObj.name}:${method}`)
        if (Route) {
          objects.push({
            method: method,
            callback: createCallback(Route, routeObj.name),
            name: routeObj.name,
            path: routeObj.path
          })
        }
      })
    }
  })
  return objects
}
