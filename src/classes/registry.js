const models = new Map()

module.exports = class Registry {
  /**
   * Sets up a given model based on it's static definition methods
   * `attributes` and `relationships`
   *
   * First processes `attributes` creating getters and setters for each
   * defined attribute
   *
   * Then process `relationships` creating getters and setters for each
   * defined relationship. Relationship getters return nested relationship
   * data where available and falls back to calling the appropriate relationship
   * method to fetch the data if not available.
   *
   * @param {Object} Model
   * @private
   * @static
   */
  static registerModel (Model) {
    Model.definition = {attributes: {}, relationships: {}}

    Model.attributes(function (name, type) {
      // create attributes metadata object
      Model.definition.attributes[name] = type

      // define properties with getters/setters for each attribute
      Reflect.defineProperty(Model.prototype, name, {
        get () {
          return this.attributes[name]
        },
        set (value) {
          // TODO: validate value to ensure it matches type
          this.attributes[name] = value
        },
        enumerable: true,
        configurable: false
        // TODO: consider setting value based on type
        // eg. if its a number set value: 0
        // if its a Date set value: new Date etc
      })
    })

    // setup relationship definition object
    Model.relationships(function (name, modelName, type) {
      // create relationship metadata object
      Model.definition.relationships[name] = type

      // define properties with getters/setters for each attribute
      Reflect.defineProperty(Model.prototype, name, {
        get () {
          // if the data has been fetched with the main record,
          // just return that wrapped in a promise
          if (this.attributes[name]) {
            // TODO: convert data to models before returning
            // 1. if array, iterate doing 2.
            // 2. new Model(data)
            // 3. return the result as a promise below
            return Promise.resolve(this.attributes[name])
          }
          // otherwise use the adapter to fetch the data
          // returned as a promise
          const adapter = Model.adapter
          const store = Model.store
          const RelatedModel = store.modelFor(modelName)

          if (type === 'hasMany') {
            return adapter.query(store, modelName, {filter: {[`${Model.modelName}Id`]: this.attributes.id}})
              .then(data => {
                console.log('data:', data)
                // cache the data in the models attributes hash
                this.attributes[name] = data
                return data.map(record => new RelatedModel(record))
              })
          } else if (type === 'hasOne') {
            return adapter.queryRecord(store, modelName, {filter: {id: this[`${type}Id`]}})
              .then(data => {
                // cache the data in the models attributes hash
                this.attributes[name] = data
                return new RelatedModel(data)
              })
          }
        },
        set (value) {
          // TODO: assert that value is correct type (array or object)
          this.attributes[name] = value
        },
        enumerable: false,
        configurable: false
      })
    })

    // keep a reference to the model in the model map
    models.set(Model.modelName, Model)
  }

  static get models () {
    return models
  }
}
