// module.exports = class ModelDefinitionValidator {
//   static validate (Model) {
//     const instance = new Model()
//     if (!Model.attributes && typeof instance.attributes === 'function') {
//       throw new Error(`method "attributes" for model "${Model.name}" must be defined statically`)
//     }
//     if (!Model.relationships && typeof instance.relationships === 'function') {
//       throw new Error(`method "relationships" for model "${Model.name}" must be defined statically`)
//     }
//     if (typeof Model.tableName !== 'string')
//       throw new Error(`static getter "tableName" for model "${Model.name}" must return a string`)
//     if (typeof Model.attributes !== 'function')
//       throw new Error(`static method "attributes" for model "${Model.name}" must be a function`)
//   }
// }
