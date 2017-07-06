module.exports = db => {
  const Stimulus = db.Model.extend({
    tableName: 'listener_stimuli',
    idAttribute: 'stimulus',
    responses: function () {
      return this.hasMany('Response', 'stimulus', 'stimulus');
    }
  });
  return db.model('Stimulus', Stimulus);
};
