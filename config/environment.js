module.exports = function () {
  const ENV = {
    database: process.env.PG_CONNECTION_STRING
  }
  return ENV
}
