module.exports = db => {
  const ForumResponse = db.Model.extend({
    tableName: 'forum-responses',
    idAttribute: 'id',
    hasTimestamps: true,
    forumTopic: function() {
      return this.belongsTo('ForumTopic');
    }
  });
  return db.model('ForumResponse', ForumResponse);
};
