var db = require('./db');
var _ = require('lodash');
var util = require('util');
const Papa = require('babyparse');

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
      return Model.where({id: id }).save(data, { patch: true }).then(updated  =>  updated.toJSON())
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
     * @param {string[][]} query - a knex.js query array
     * @param {string[]} relations - an Array of relations
     * @returns {Object[]} An array of models returned
     */
    this[`query${modelName}`] = function(query, relations) {
      var p = query.reduce((prev, curr) => {
        return prev.query.apply(prev, curr)
      }, Model)
      if(relations) {
      return p.fetchAll({ withRelated: relations }).then(data => data.toJSON());
      }
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
     * Retun all models in DB
     * @method Worker#allModels
     * @returns {Object[]}  all models in DB
     */
    this[`all${modelName}s`] = function() {
      return Model.fetchAll().then(data => data.toJSON());
    }
  })
    /**
     * 
     * 
     * Retun all models in DB
     * @method Worker#getInitialQuestions
     * @param {string} trialName - The name of the trial looking for inital questions for
     * @returns {Object[]}  questions for that Trial
     */
    this.getInitialQuestions =  function(trialName) {
      return db.model('Question').forge().query(qb => {
        qb.offset(0).limit(2);
      }).fetchAll({withRelated: 'choices'}).then(data => {
        return db.model('User').forge().save().then(user => {
          const json = data.toJSON();
          return {
            questions: json,
            user: user.toJSON()
          }
        })
      })
    }
    this.setUserLanguages = function(userId, {primaryLanguages, nativeLanguages }) {
      return Promise.all(primaryLanguages.map(lang => db.knex.raw('INSERT into "userLanguages" ("userId", "primary", "native", "languageId") SELECT ?, ?, ?, id from languages WHERE name = ? RETURNING *', [
        userId, 
        true,
        false,
        lang,
      ]).then(resp => resp.rows))).then(data => {
        return Promise.all(
          nativeLanguages.map(lang => 
            db.knex.raw('INSERT into "userLanguages" ("userId", "primary", "native", "languageId") SELECT ?, ?, ?, id from languages WHERE name = ? RETURNING *', [
              userId, 
              false,
              true,
              lang,
            ])
            .then(resp => resp.rows)))
            .then(stuff => {
              return db.model('User').where({ id: userId }).fetch({ withRelated: ['userLanguages.language'] }).then(data => data.toJSON());
            })
        })
    }
    this.getResponseCsv = function() {
      return db.knex('users')
      .join('responses', 'responses.userId', '=', 'users.id')
      .join('choices', 'choices.id', '=', 'responses.choiceId')
      .join('questions', 'choices.questionId', '=', 'questions.id')
      .select('users.*','questions.prompt','choices.imageUrl', 'choices.displayText', 'choices.correct', 'choices.type')
      .then(data => {
        return Papa.unparse(data);
      })
    }
    this.getResults = function(userId) {
      return db.knex('users')
        .select('responses.*')
        .join('responses', 'responses.userId', '=', 'users.id')
        .then(choices => {
          let obj = {};
            choices.forEach(response => {
              if (Array.isArray(obj[response.userId])) {
                obj[response.userId].push(response.choiceId)
              } else {
                obj[response.userId] = [response.choiceId]
              }
            });
          return obj;
        }).then(keymap => {
          let userArray = keymap[userId];
          if (userArray) {
            delete keymap[userId];
            var output = [];
            userArray = userArray.sort();
            for (var prop in keymap) {
              keymap[prop] = keymap[prop].sort();
              output.push({
                match: intersect_safe(userArray, keymap[prop].sort()).length,
                userId: prop,
              })
            }
            return output;
          }
        }).then(output => {
          if(output) {
            console.log(output);
            let users = _.take(_.orderBy(output, 'match', 'desc'), 3);
            return db.knex('users').distinct('languages.name').select('languages.name').whereIn('users.id', users.map(u => u.userId))
            .join('userLanguages', 'users.id', 'userLanguages.userId')
            .join('languages', 'userLanguages.languageId', 'languages.id')
          }
          return null;
        })
    }
}
function intersect_safe(a, b)
{
  var ai=0, bi=0;
  var result = [];

  while( ai < a.length && bi < b.length )
  {
     if      (a[ai] < b[bi] ){ ai++; }
     else if (a[ai] > b[bi] ){ bi++; }
     else /* they're equal */
     {
       result.push(a[ai]);
       ai++;
       bi++;
     }
  }

  return result;
}

module.exports = new Worker();