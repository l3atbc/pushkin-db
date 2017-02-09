// create the actual db connection
const knex = require('knex')(require('./knexfile.js').development);


// config for transaction DB
const config = {
  client: 'postgresql',
  connection: 'postgres://postgres:postgres@transactiondb/transactions'
};

// create connection to transaction db
const db2 = require('knex')(config)

// test db connection
db2.raw('select 1+1 as result').then(() => {
  console.log('valid connection..');
});

// whenever there is a query, save result in second db
knex.on('query-response', function(one, two, three) {
  const obj = {
    bindings: three.toSQL().bindings,
    query: three.toSQL().sql,
  };
  return db2('transactions').insert(obj);
});

// instantiate bookshelf models
var fs = require('fs');
var bookshelf = module.exports = require('bookshelf')(knex);

// registry plugin to handle models that reference each other
// more info available at: https://github.com/tgriesser/bookshelf/wiki/Plugin:-Model-Registry

bookshelf.plugin('registry');

// require all models and pass in db connection

var models = fs.readdirSync('./models');
models.forEach(function(model) {
  require('./models/' + model)(bookshelf);
});
