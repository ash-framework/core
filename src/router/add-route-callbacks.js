const createCallback = require('./create-callback')
const loadFile = require('./load-file')
const path = require('path')
const fileExists = require('./file-exists')

const allowedMethods = ['get', 'put', 'post', 'patch', 'delete', 'options', 'head']

function addRouteCallbacks (routeObjects, routesDir) {
  const objects = []
  routeObjects.forEach(routeObj => {
    if (routeObj.name === 'index') return

    if (routeObj.children.length > 0) {
      const sameNamedChild = routeObj.children.filter(children => children.name === routeObj.name)[0]
      if (!sameNamedChild || (sameNamedChild && sameNamedChild.path !== '/')) {
        // implicit routes
        allowedMethods.forEach(method => {
          let Route
          if (method.toLowerCase() === 'get') {
            if (fileExists(`${routeObj.name}/index.js`, routesDir)) {
              Route = loadFile(`${routeObj.name}/index.js`, routesDir)
            } else if (fileExists(`${routeObj.name}/index.get.js`, routesDir)) {
              Route = loadFile(`${routeObj.name}/index.get.js`, routesDir)
            }
          }
          if (!Route && fileExists(`${routeObj.name}/index.${method}.js`, routesDir)) {
            Route = loadFile(`${routeObj.name}/index.${method}.js`, routesDir)
          }
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

      // recurse

      objects.push({
        path: routeObj.path,
        children: addRouteCallbacks(routeObj.children, path.join(routesDir, routeObj.name))
      })
    } else {
      // explicit routes
      allowedMethods.forEach(method => {
        let Route
        if (method.toLowerCase() === 'get') {
          if (fileExists(`${routeObj.name}.js`, routesDir)) {
            Route = loadFile(`${routeObj.name}.js`, routesDir)
          } else if (fileExists(`${routeObj.name}.get.js`, routesDir)) {
            Route = loadFile(`${routeObj.name}.get.js`, routesDir)
          } else if (fileExists(`${routeObj.name}/index.get.js`, routesDir)) {
            Route = loadFile(`${routeObj.name}/index.get.js`, routesDir)
          } else if (fileExists(`${routeObj.name}/index.js`, routesDir)) {
            Route = loadFile(`${routeObj.name}/index.js`, routesDir)
          }
        } else if (fileExists(`${routeObj.name}.${method}.js`, routesDir)) {
          Route = loadFile(`${routeObj.name}.${method}.js`, routesDir)
        } else if (fileExists(`${routeObj.name}/index.${method}.js`, routesDir)) {
          Route = loadFile(`${routeObj.name}/index.${method}.js`, routesDir)
        }
        if (Route) {
          objects.push({
            method: method,
            callback: createCallback(Route),
            name: routeObj.name,
            path: routeObj.path
          })
        }
      })
    }
  })
  return objects
}

module.exports = addRouteCallbacks
