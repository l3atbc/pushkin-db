
exports.up = function(knex, Promise) {
  return knex.schema.createTable('messages', function(table) {
    table.increments();
    table.timestamps();
    table.string('text');
  })
  
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('messages');
};
