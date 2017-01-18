const amqp = require('amqplib');
var db = require('./db');
var winston = require('winston');


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
    const q = 'db_rpc_worker';
    let ok = ch.assertQueue(q, { durable: false }).then(() => {
      ch.prefetch(1);
      return ch.consume(q, function reply(msg) {
        var rpc = JSON.parse(msg.content.toString('utf8'));
        winston.info('db_rpc_worker', {rpc, msg })
        return Worker[rpc.method].apply(Worker, rpc.arguments).then(data => {
          winston.info(data)
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
          winston.info('DB WRITE QUEUE', msg.content.toString('utf8'))
          var rpc = JSON.parse(msg.content.toString('utf8'));
          return Worker[rpc.method].apply(Worker, rpc.arguments).then(data => {
            winston.info('was saved in db', data)
            return ch.ack(msg);
          })
        })
      })
    });

    return ok.then(ch => {
      winston.log(' [x] Awaiting requests');
    });
  });
});

winston.handleExceptions(winston.transports);