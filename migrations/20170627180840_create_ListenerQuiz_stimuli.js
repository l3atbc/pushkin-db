exports.up = function(knex) {
  return knex.schema.createTable('ListenerQuiz_stimuli', table => {
    table.string('stimulus').primary();
    table.integer('num_responses');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('ListenerQuiz_stimuli');
};
