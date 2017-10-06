exports.up = function(knex, Promise) {
  return knex.schema.createTable('forum-responses', table => {
    table.increments('id').primary();
    table.string('auth0_uid');
    table.string('responses');
    table.timestamp('created_at');
    table
      .integer('topic_id')
      .references('id')
      .inTable('forum-topics');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('forum-responses');
};
