const knex = require('knex')({
  client: 'postgresql',
  connection: process.env.DATABASE_URL,
});

const Bookshelf = require('bookshelf')(knex);
const amqp = require('amqplib');

Bookshelf.plugin('registry');
const Message = Bookshelf.Model.extend({
  tableName: 'messages',
  hasTimestamps: true,
});

amqp.connect(process.env.AMPQ_ADDRESS).then(conn => {
  process.once('SIGINT', function () {
    conn.close();
  });
  // Db Write
  return conn.createChannel().then(ch => {
    const q = 'db_queue';
    const ok = ch.assertQueue(q, {
      durable: true
    });
    // prefetch due to multiple db writers
    ok.then(() => {
      ch.prefetch(1);
    }).then(() => {
      // consume messages
      return ch.consume(q, function (msg) {
        console.log(" [x] Received %s", msg.content.toString());
        const message = new Message({
          text: msg.content.toString()
        });

        return message.save().then(() => {
          ch.ack(msg);
        })
      }, {
        noAck: false
      });
    })
    return ok.then(() => {
      console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
    })
  });
})
amqp.connect(process.env.AMPQ_ADDRESS).then(conn => {

  return conn.createChannel().then(ch => {
    process.once('SIGINT', function () {
      conn.close();
    });
    const q = 'db_read';
    const ok = ch.assertQueue(q, {
      durable: false
    }).then(() => {
      ch.prefetch(1);
      return ch.consume(q, function reply(msg) {
        const n = parseInt(msg.content.toString());
        console.log(" [.] fib(%d)", n);
        const r = n * 1000
        return Message.fetchAll().then(messages => {
          ch.sendToQueue(msg.properties.replyTo,
            new Buffer(JSON.stringify(messages)), {
              correlationId: msg.properties.correlationId
            });
          ch.ack(msg);
        })
      });
    })
    return ok.then(ch => {
      console.log(' [x] Awaiting RPC requests');
    });
  });
});