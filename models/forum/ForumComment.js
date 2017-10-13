module.exports = db => {
  const ForumComment = db.Model.extend({
    tableName: 'forum-comments',
    idAttribute: 'id',
    forumPost: function() {
      return this.belongsTo('ForumPost');
    }
  });
  return db.model('ForumComment', ForumComment);
};
