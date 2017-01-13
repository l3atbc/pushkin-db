exports.up = function(knex, Promise) {
  return knex.schema.createTable('languages', table => {
    table.increments().primary();
    table.string('name');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('languages');
};
