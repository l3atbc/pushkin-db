const knex = require('knex')({
  client: 'postgresql',
  connection: process.env.DATABASE_URL
});

var fs = require('fs');
var bookshelf = module.exports = require('bookshelf')(knex);
var models = fs.readdirSync('./models');

bookshelf.plugin('registry');

models.forEach(function(model) {
  require('./models/' + model)(bookshelf);
});
