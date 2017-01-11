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

var amqp = require('amqplib');
amqp.connect(process.env.AMPQ_ADDRESS).then(conn =>{
  process.once('SIGINT', function() { conn.close(); });
  // Db Write
  return conn.createChannel().then(ch =>{
    var q = 'db_queue';
    var ok = ch.assertQueue(q, {durable: true});
    ok.then(() => {
      ch.prefetch(1);
    }).then(() => {
      return ch.consume(q, function(msg) {
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
    })
    return ok.then(() => {
      console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
    })
  });
  // Db read
})
amqp.connect(process.env.AMPQ_ADDRESS).then(conn =>{

return conn.createChannel().then(ch => {
  process.once('SIGINT', function() { conn.close(); });
    var q = 'db_read';
    var ok =  ch.assertQueue(q, {durable: false}).then(() => {
      ch.prefetch(1);
      return ch.consume(q, function reply(msg) {
        var n = parseInt(msg.content.toString());
        console.log(" [.] fib(%d)", n);
        var r = n * 1000
        return Message.fetchAll().then(messages => {
          ch.sendToQueue(msg.properties.replyTo,
            new Buffer(JSON.stringify(messages)),
            {correlationId: msg.properties.correlationId});
          ch.ack(msg);
          })
      });
    })
    return ok.then(ch => {
      console.log(' [x] Awaiting RPC requests');
    });
  });
});