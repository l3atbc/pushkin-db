const knex = require('knex')(require('./knexfile.js').development);

var fs = require('fs');
var bookshelf = module.exports = require('bookshelf')(knex);
var models = fs.readdirSync('./models');

bookshelf.plugin('registry');

models.forEach(function(model) {
  require('./models/' + model)(bookshelf);
});
