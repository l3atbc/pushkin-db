module.exports = db => {
  const ForumPost = db.Model.extend({
    tableName: 'forum-posts',
    idAttribute: 'id',
    forumComments: function() {
      return this.hasMany('ForumComment', 'post_id', 'id');
    }
  });
  return db.model('ForumPost', ForumPost);
};
