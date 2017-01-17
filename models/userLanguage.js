// var bookshelf = require('../db');
// require('./user');
// require('./language');

module.exports = db => {
  const UserLanguage = db.Model.extend({
    tableName: 'responses',
    language() {
      return this.belongsTo('Language', 'languageId');
    },
    user() {
      return this.belongsTo('User');
    }
  });
  return db.model('UserLanguage', UserLanguage);
};
