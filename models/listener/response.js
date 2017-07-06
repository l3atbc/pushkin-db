module.exports = db => {
  const Response = db.Model.extend({
    tableName: 'listener_responses',
    idAttribute: 'id',
    hasTimestamps: true,
    user: function() {
      return this.belongsTo('User', 'user_id', 'id');
    },
    stimulus: function() {
      return this.belongsTo('Stimulus', 'stimulus', 'stimulus')
    }
  });
  return db.model('Response', Response);
};
