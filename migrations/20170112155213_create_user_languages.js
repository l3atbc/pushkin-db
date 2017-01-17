// const knex = require('knex')(require('./knex.config.js'));

exports.up = function(knex, Promise) {
  return knex.schema.createTable('userLanguages', table => {
    table.increments();
    table.boolean('prime');
    table.boolean('national');
    table.integer('userId').references('id').inTable('users');
    table.integer('languageId').references('id').inTable('languages');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('userLanguages');
};
