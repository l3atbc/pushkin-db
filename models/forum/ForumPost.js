module.exports = db => {
  const ForumPost = db.Model.extend({
    tableName: 'forum-posts',
    idAttribute: 'id',
    forumComments: function() {
      return this.hasMany('ForumComment');
    }
  });
  return db.model('ForumPost', ForumPost);
};
