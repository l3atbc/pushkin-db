const knex = require('knex')(require('./knexfile.js').development);

const config = {
  client: 'postgresql',
  connection: 'postgres://postgres:postgres@transactiondb/transactions'
};

const db2 = require('knex')(config)

db2.raw('select 1+1 as result').then(() => {
  console.log('valid connection..');
});

knex.on('query-response', function(one, two, three) {
  const obj = {
    bindings: three.toSQL().bindings,
    query: three.toSQL().sql,
  };
  return db2('transactions').insert(obj);
});

var fs = require('fs');
var bookshelf = module.exports = require('bookshelf')(knex);
var models = fs.readdirSync('./models');

bookshelf.plugin('registry');

models.forEach(function(model) {
  require('./models/' + model)(bookshelf);
});
