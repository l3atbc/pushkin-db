var db = require('./db');

/**
 * 
 * 
 * DB writer and reader class with automatically generated methods
 * @class Worker
 */
function Worker() {
  debugger;
  var models = Object.keys(db._models);
  models.forEach(modelName => {
    var Model = db.model(modelName);
    const methods = [
      `create${modelName}`,
      `update${modelName}`,
      `delete${modelName}`,
      `find${modelName}`,
      `query${modelName}`,
      `raw${modelName}`,
      `all${modelName}`,
    ]
    /**
     * 
     * 
     * 
     * Create a new Model in the DB
     * @method Worker#createModel
     * @param {any} data - model to be created
     * @returns {any} The saved model
     */
    this[`create${modelName}`] = function(data) {
      return new Model(data).save().then(data => {
        return data.toJSON();
      });
    };
    /**
     * 
     * 
     * @method Worker#findModel
     * @param {number} id - The id of the model looking for
     * @param {string[]} [relations] - an array of related models to fetch
     * @returns {Object} The model with its relations
     */
    this[`find${modelName}`] = function(id, relations) {
      if(Array.isArray(relations) && relations.length) {
        return Model.where({ id: id }).fetch({ withRelated: relations }).then(data => {
          if(data) {
            return data.toJSON();
          }
          return null;
        });
      }
        return Model.where({ id: id }).fetch().then(data => {
          if(data) {
            return data.toJSON();
          }
          return null;
        })
    };
    /**
     * 
     * 
     * @method Worker#updateModel
     * @param {number} id - the id of the model being updated
     * @param {Object} data - the data to update
     * @returns {Object} The newly updated model
     */
    this[`update${modelName}`] = function(id, data) {
      return new Model({id: id }).save(data).then(updated  =>  updated.toJSON())
    }
    /**
     * 
     * 
     * @method Worker#deleteModel
     * @param {Number} id - the id of the model to be deleted
     * @returns {Number} 0 if success
     */
    this[`delete${modelName}`] = function(id) {
      return new Model({id: id }).destroy().then(model => {
        return 0;
      })
    }
    /**
     * 
     * 
     * @method Worker#queryModel
     * @param {string[][]} query
     * @returns {Object[]} An array of models returned
     */
    this[`query${modelName}`] = function(query) {
      var p = query.reduce((prev, curr) => {
        return prev.query.apply(prev, curr)
      }, Model)
      return p.fetchAll().then(data => data.toJSON());
    }
    /**
     * 
     * 
     * Allows raw queries on DB
     * @method Worker#rawModel
     * @param {String[][]} query - a raw knexjs query array
     * @example
     * rawModel([
     *   ['where', 'name', '=', 'foo'],
     *   ['where', 'age', '<', 20 ],
     * ])
     * @returns {Object[]}
     */
    this[`raw${modelName}`] = function(query) {
      return db.knex.raw(query).then(resp => resp.rows);
    }
    /**
     * 
     * 
     * Rertun all models in DB
     * @method Worker#allModels
     * @returns {Object[]}  all models in DB
     */
    this[`all${modelName}s`] = function() {
      return Model.fetchAll().then(data => data.toJSON());

    }

  })
}

module.exports = new Worker();