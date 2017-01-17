// var bookshelf = require('../db');
// require('./response');
// require('./userLanguage');
module.exports = db => {
  const User = db.Model.extend({
    tableName: 'users',
    responses() {
      return this.hasMany('Response');
    },
    userLanguages() {
      return this.hasMany('UserLanguage');
    },
    languages() {
      return this
        .hasMany('Language', 'userId')
        .through('UserLanguage', 'userId', 'languageId');
    }
  });
  return db.model('User', User);
};
