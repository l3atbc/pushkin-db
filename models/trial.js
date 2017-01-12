// require('./question');
module.exports = db => {
  const Trial = db.Model.extend({
    tableName: 'trials',
    questions() {
      this.hasMany('Question');
    }
  });
  return db.model('Trial', Trial);
};
