exports.up = function(knex, Promise) {
  return knex.schema.createTable('trials', table => {
    table.increments('id').primary();
    table.string('name');
    table.timestamps();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('trials');
};
