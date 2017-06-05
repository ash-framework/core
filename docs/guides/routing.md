# Routing

Routing works similarly to Ember.js but with some notable differences.

## Examples

### Basic route

#### Definition
```js
// router.ts
Router.map(function () {
  this.route('users')
})
```

#### Directory structure
```
- app
  - routes
    - users.ts
    - users.post.ts
    - users.patch.ts
    - users.put.ts
    - users.delete.ts
```

As you can see file naming is used to determine which route file to use for 
each http verb.

These are all optional. If you only need a GET route you can omit all the others.

Also note that for GET routes you do not need to define the verb in the filename.
`users.ts` is the same as `users.get.ts` and both will work.

### Nested route with url parameter

#### Definition
```js
// router.ts
Router.map(function () {
  this.route('users', function () {
    this.route('user', { path: '/:user_id' })
  })
})
```

#### Directory structure
```
- app
  - routes
    - users
      - index.ts
      - index.post.js
      - index.patch.js
      - index.delete.js
      - index.put.js
      - user.ts
      - user.post.ts
      - user.patch.ts
      - user.delete.ts
      - user.put.ts
```

Index routes are implicit and provides a way to define a route at the
same level as the parent route.

The following
```js
// router.ts
Router.map(function () {
  this.route('users', function () {
    this.route('user', { path: '/:user_id' })
  })
})
```
Is equivalent to:
```js
// router.ts
Router.map(function () {
  this.route('users', function () {
    this.route('index', { path: '/' })
    this.route('user', { path: '/:user_id' })
  })
})
```

#### Urls
```
GET localhost:3010/users
POST localhost:3010/users
PATCH localhost:3010/users
DELETE localhost:3010/users
PUT localhost:3010/users

GET localhost:3010/users/:user_id
POST localhost:3010/users/:user_id
PATCH localhost:3010/users/:user_id
DELETE localhost:3010/users/:user_id
PUT localhost:3010/users/:user_id
```

### A typical CRUD setup example

#### Definition
```js
// router.ts
Router.map(function () {
  this.route('users', function () {
    this.route('user', { path: '/:user_id' })
  })
})
```

#### Directory structure
```
- app
  - routes
    - users
      - index.ts
      - index.post.js
      - user.ts
      - user.patch.ts
      - user.delete.ts
```

#### Urls
```
// find all users
GET localhost:3010/users

// create a user
POST localhost:3010/users

// find a single user by id
GET localhost:3010/users/:user_id

// update a single user by id
PATCH localhost:3010/users/:user_id

// delete a single user by id
DELETE localhost:3010/users/:user_id
```
