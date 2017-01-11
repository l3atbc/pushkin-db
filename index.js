var knex = require('knex')({
  client: 'postgresql',
  connection: process.env.DATABASE_URL,
});

var Bookshelf = require('bookshelf')(knex);
Bookshelf.plugin('registry');
const Message  = Bookshelf.Model.extend({
  tableName: 'messages',
  hasTimestamps: true,
});

var amqp = require('amqplib/callback_api');
amqp.connect(process.env.AMPQ_ADDRESS, function(err, conn) {
  conn.createChannel(function(err, ch) {
    var q = 'db_queue';
    ch.assertQueue(q, {durable: true});
    ch.prefetch(1);
    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
    ch.consume(q, function(msg) {
      var secs = msg.content.toString().split('.').length - 1;
      console.log(" [x] Received %s", msg.content.toString());
      const message = new Message({ text: msg.content.toString() });
      message.save()
      setTimeout(function() {
        console.log(message);
        console.log(" [x] Done");
        ch.ack(msg);
      }, secs * 1000);
    }, {noAck: false});
  });
});