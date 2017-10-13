exports.up = function(knex, Promise) {
  return knex.schema.createTable('forum-posts', table => {
    table.increments('id').primary();
    table.timestamp('created_at');
    table.string('post_subject');
    table.integer('stim_id');
    table.string('post_content');
    table.string('auth0_id');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('forum-posts');
};
