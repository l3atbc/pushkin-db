exports.up = function(knex) {
  return knex.schema.createTable('listener_stimuli', table => {
    table.string('stimulus').primary();
    table.integer('num_responses');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('listener_stimuli');
};
