// const Bookshelf = require('../db');
module.exports = db => {
  const Message = db.Model.extend({
    tableName: 'messages',
    hasTimestamps: true
  });
  return db.model('Message', Message);
};
