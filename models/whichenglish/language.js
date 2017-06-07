// var bookshelf = require('../db');
// require('./userLanguage');

module.exports = db => {
  const Language = db.Model.extend({
    tableName: 'languages',
    users() {
      return this.hasMany('User')
      .through('UserLanguage');
    },
    userLanguages() {
      return this.hasMany('UserLanguage', 'id');
    }
  });
  return db.model('Language', Language);
};
