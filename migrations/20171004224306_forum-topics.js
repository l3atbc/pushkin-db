exports.up = function(knex, Promise) {
  return knex.schema.createTable('forum-topics', table => {
    table.increments('id').primary();
    table.timestamp('created_at');
    table.string('topic_content');
    table.string('auth0_uid');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('forum-topics');
};
