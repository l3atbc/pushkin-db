const db = require('./db');
const _ = require('lodash');
const Papa = require('babyparse');

/**
 *
 *
 * DB writer and reader class with automatically generated methods
 * **These methods are created automatically based off what it defined by bookshelf**
 * @class Worker
 */
function Worker() {
  let models = Object.keys(db._models);
  models.forEach((modelName) => {
    let Model = db.model(modelName);
    const methods = [
      `create${modelName}`,
      `update${modelName}`,
      `delete${modelName}`,
      `find${modelName}`,
      `query${modelName}`,
      `raw${modelName}`,
      `all${modelName}`,
    ];
    /**
     *
     *
     *
     * Create a new Model in the DB
     * @method Worker#createModel
     * @param {any} data - model to be created
     * @returns {Promise} The saved model
     * @fulfill {Object}
     * @reject {Error}
     * @example
     * createUser({ name: "Methuselah", age: 1000 })
     */
    this[`create${modelName}`] = function(data) {
      return new Model(data).save().then((data) => {
        return data.toJSON();
      });
    };
    /**
     *
     *
     * @method Worker#findModel
     * @param {number} id - The id of the model looking for
     * @param {string[]} [relations] - an array of related models to fetch
     * @returns {Promise}
     * @fulfill {Object} - The found model
     * @reject {Error}
     * @example
     *
     * findUser(1, ['posts'])
     */
    this[`find${modelName}`] = function(id, relations) {
      if(Array.isArray(relations) && relations.length) {
        return Model.where({ id: id }).fetch({ withRelated: relations }).then((data) => {
          if(data) {
            return data.toJSON();
          }
          return null;
        });
      }
        return Model.where({ id: id }).fetch().then((data) => {
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
     * @returns {Promise}
     * @fulfill {Object} - The newly updated model
     * @reject {Error}
     * @example
     *
     * updateUser(1, { age: 969 })
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
     * @example
     * deleteUser(1);
     */
    this[`delete${modelName}`] = (id) => {
      return new Model({ id }).destroy().then((model) => {
        return 0;
      })
    }
    /**
     *
     *
     * @method Worker#queryModel
     * @param {string[][]} query - a knex.js query array see http://knexjs.org/#Builder
     * @param {string[]} relations - an Array of relations
     * @return {Promise}
     * @fulfill {Object[]} - An array of models returned
     * @reject {Error}
     * @example
     * queryModel([
     *  ['where', 'other_id', '=', '5'],
     *  ['where', 'name', '=', 'foo']
     * ],
     * ['posts']
     * )
     */
    this[`query${modelName}`] = (query, relations) => {
      const p = query.reduce((prev, curr) => {
        return prev.query.apply(prev, curr);
      }, Model);
      if (relations) {
        return p.fetchAll({ withRelated: relations }).then(data => data.toJSON());
      }
      return p.fetchAll().then(data => data.toJSON());
    };
    /**
     * Allows raw queries on DB
     * @method Worker#rawModel
     * @param {String[][]} query - a raw knexjs query array
     * @returns {Promise}
     * @fulfill {Object[]} - an array of results
     * @reject {Error}
     * @example
     * rawUser([
     *   ['where', 'name', '=', 'Methuselah'],
     *   ['where', 'age', '>', 900 ],
     * ])
     */
    this[`raw${modelName}`] = (query) => {
      return db.knex.raw(query).then(resp => resp.rows);
    };
    /**
     * Return all models in DB
     * @method Worker#allModels
     * @returns {Promise}
     * @fulfill {Object[]} -  all models in DB
     * @reject {Error}
     * @example
     * allUsers()
     */
    this[`all${modelName}s`] = () => {
      return Model.fetchAll().then(data => data.toJSON());
    };
  });
  /**
   * Return all models in DB
   * @method Worker#getInitialQuestions
   * @param {string} trialName - The name of the trial looking for inital questions for
   * @returns {Promise}
   * @fulfill {Object[]} -   questions for that Trial
   * @reject {Error}
   * @todo Make this query on the trial Name
   */
  this.getInitialQuestions =  (trialName) => {
    return db.model('Question')
    .forge()
    .query((qb) => {
      qb.offset(0).limit(2);
    })
    .fetchAll({ withRelated: 'choices' })
    .then((data) => {
      return db.model('User').forge().save().then((user) => {
        const json = data.toJSON();
        return {
          questions: json,
          user: user.toJSON(),
        };
      });
    });
  };
  /**
   *
   * Sets a users Languages
   * @method Worker#setUserLanguages
   * @param {number} userId - the name of the id to set
   * @param {Object} set
   * @param {String[]} set.primaryLanguages - the user's primary Languages
   * @param {String[]} set.nativeLanguages - the user's native Languages
   * @returns {Promise}
   * @fulfill {Object} - the user with their languages
   * @rejects {Error}
   * @example
   * setUserLanguages(1, {
   *  primaryLanguages: ["Hebrew", "Aramaic"],
   * nativeLanguages: ["Hebrew"]
   * })
   */
  this.setUserLanguages = (userId, { primaryLanguages, nativeLanguages }) => {
    return Promise.all(primaryLanguages.map(lang => db.knex.raw('INSERT into "userLanguages" ("userId", "primary", "native", "languageId") SELECT ?, ?, ?, id from languages WHERE name = ? RETURNING *', [
      userId,
      true,
      false,
      lang,
    ]).then(resp => resp.rows))).then((data) => {
      return Promise.all(
        nativeLanguages.map(lang =>
          db.knex.raw('INSERT into "userLanguages" ("userId", "primary", "native", "languageId") SELECT ?, ?, ?, id from languages WHERE name = ? RETURNING *', [
            userId,
            false,
            true,
            lang,
          ])
          .then(resp => resp.rows)))
          .then((stuff) => {
            return db.model('User').where({ id: userId }).fetch({ withRelated: ['userLanguages.language'] }).then(userData => userData.toJSON());
          });
    });
  };
  this.getResponseCsv = () => {
    return db.knex('users')
    .join('responses', 'responses.userId', '=', 'users.id')
    .join('choices', 'choices.id', '=', 'responses.choiceId')
    .join('questions', 'choices.questionId', '=', 'questions.id')
    .select('users.*','questions.prompt','choices.imageUrl', 'choices.displayText', 'choices.correct', 'choices.type')
    .then((data) => {
      return Papa.unparse(data);
    });
  };
  /**
   * Get the results from the DB
   * @method Worker#getResults
   * @param {number} userId - the user whose results you are grabbing
   * @returns {Promise}
   * @fulfill {Object[]} - an array of the top 3 languages for this user
   * @rejects {Error}
   */
  this.getResults = (userId) => {
    return db.knex('users')
      .select('responses.*')
      .join('responses', 'responses.userId', '=', 'users.id')
      .then((choices) => {
        let obj = {};
          choices.forEach((response) => {
            if (Array.isArray(obj[response.userId])) {
              obj[response.userId].push(response.choiceId)
            } else {
              obj[response.userId] = [response.choiceId]
            }
          });
        return obj;
      })
      .then((keymap) => {
        let userArray = keymap[userId];
        if (userArray) {
          delete keymap[userId];
          let output = [];
          userArray = userArray.sort();
          for (let prop in keymap) {
            keymap[prop] = keymap[prop].sort();
            output.push({
              match: intersect_safe(userArray, keymap[prop].sort()).length,
              userId: prop,
            })
          }
          return output;
        }
      })
      .then((output) => {
        if (output) {
          const users = _.take(_.orderBy(output, 'match', 'desc'), 3);
          return db.knex('users').distinct('languages.name').select('languages.name').whereIn('users.id', users.map(u => u.userId))
          .join('userLanguages', 'users.id', 'userLanguages.userId')
          .join('languages', 'userLanguages.languageId', 'languages.id')
        }
        return null;
      });
  };
}

// returns the intersection between 2 arrays
function intersect_safe(a, b) {
  let ai = 0, bi = 0;
  let result = [];
  while (ai < a.length && bi < b.length) {
    if (a[ai] < b[bi]) { ai++; }
    else if (a[ai] > b[bi]) { bi++; }
    else /* they're equal */ {
      result.push(a[ai]);
      ai++;
      bi++;
    }
  }

  return result;
}

module.exports = new Worker();