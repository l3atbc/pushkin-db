// var bookshelf = require('../db');
// require('./userLanguage');

module.exports = db => {
  const Language = db.Model.extend({
    tableName: 'languages',
    userLanguages() {
      return this.hasMany('UserLanguage');
    }
  });
  return db.model('Language', Language);
};
