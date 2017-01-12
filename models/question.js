// require('./trial');
module.exports = db => {
  const Question = db.Model.extend({
    tableName: 'questions',
    trial() {
      return this.belongsTo('Trial', 'trialId');
    }
  });
  return db.model('Question', Question);
};
