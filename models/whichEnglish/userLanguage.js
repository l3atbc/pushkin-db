// var bookshelf = require('../db');
// require('./user');
// require('./language');

module.exports = db => {
  const UserLanguage = db.Model.extend({
    tableName: 'userLanguages',
    language() {
      return this.belongsTo('Language', 'languageId');
    },
    languages() {
      return this.belongsTo('Language', 'languageId');
    },
    user() {
      return this.belongsTo('User', 'userId');
    }
  });
  return db.model('UserLanguage', UserLanguage);
};
