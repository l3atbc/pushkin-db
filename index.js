const amqp = require('amqplib');
var db = require('./db');

const Trial = db.model('Trial');
const TrialCollection = db.Collection.extend({
  model: Trial
})
const Worker = require('./worker');
amqp.connect(process.env.AMPQ_ADDRESS).then(conn => {
  return conn.createChannel().then(ch => {
    process.once('SIGINT', function() {
      conn.close();
    });
    const q = 'db_worker';
    const ok = ch.assertQueue(q, { durable: false }).then(() => {
      ch.prefetch(1);
      return ch.consume(q, function reply(msg) {
        var rpc = JSON.parse(msg.content.toString('utf8'));
        console.log(rpc.method, rpc.arguments)
        return Worker[rpc.method].apply(Worker, rpc.arguments).then(data => {
          ch.sendToQueue(
            msg.properties.replyTo,
            new Buffer(JSON.stringify(data)),
            { correlationId: msg.properties.correlationId }
          );
          ch.ack(msg);
        });
      });
    });
    ok = ok.then(() => {
      return ch.assertQueue('db_write', { durable: true }).then(() => {
        ch.prefetch(1);
        return ch.consume('db_write', function reply(msg) {
        console.log('DB WRITE QUEUE', msg.content.toString('utf8'))
          var rpc = JSON.parse(msg.content.toString('utf8'));
          return Worker[rpc.method].apply(Worker, rpc.arguments).then(data => {
            console.log(data, 'was saved in db')
            return ch.ack(msg);
          })
        })
      })
    });

    return ok.then(ch => {
      console.log(' [x] Awaiting requests');
    });
  });
});
