module.exports = function () {
  const ENV = {
    database: {
      connection: {
        database: process.env.PG_DB,
        user: process.env.PG_USER
      }
    }
  }
  return ENV
}
