var db = require('./db');

function Worker(connection) {
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
    console.log(methods)
    this[`create${modelName}`] = function(data) {
      return new Model(data).save().then(data => {
        return data.toJSON();
      });
    };
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
    this[`update${modelName}`] = function(id, data) {
      return new Model({id: id }).save(data).then(updated  =>  updated.toJSON())
    }
    this[`delete${modelName}`] = function(id, data) {
      return new Model({id: id }).destroy().then(model => {
        return 0;
      })
    }

  })
  console


}

module.exports = new Worker();