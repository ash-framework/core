# Routes

Routes handle traffic from specific urls as defined in `router.ts`
Different Http verbs share the same router definition but are automatically
routed to different files. 

The following route can handle any http verb by file naming convention

```js
// router.ts
Router.map(function () {
  this.route('users')
})
```

To handle `GET` requests sent to `http://localhost:3010/users` we just need to create
a route file at the following location

```
- app
  - routes
    - users.ts
```

And `app/routes/users.ts` will import Ash's `Route` class and extend it.

```js
import { Route } from 'ash-core'

export default class extends Route {

}
```

It also needs to implement the model hook to return some data. Any data returned 
from a route's model hook will be sent back to the requesting client.

```js
export default class extends Route {
  model () {
    return [
      { id: 1, name: 'Andrew' },
      { id: 2, name: 'George' },
      { id: 3, name: 'Ersin' }
    ]
  }
}
```

It's typically not much use returning static data like this so we could lookup
and return data from a database using some ORM.

```js
export default class extends Route {
  model () {
    return orm.findAll('users')
  }
}
```

In this example, we are assuming that the ORMs methods return promises which
will be automatically unpacked by Ash so you don't need to.
