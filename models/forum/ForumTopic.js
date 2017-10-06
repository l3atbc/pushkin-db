module.exports = db => {
  const ForumTopic = db.Model.extend({
    tableName: 'forum-topics',
    idAttribute: 'id',
    hasTimestamps: true,
    forumResponse: function() {
      return this.hasMany('ForumResponse');
    }
  });
  return db.model('ForumTopic', ForumTopic);
};
