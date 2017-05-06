const amqp = require('amqplib');
const winston = require('winston');
const Worker = require('./worker');
const DB_WRITE_QUEUE = '_db_write';
const DB_RPC_WORKER = '_rpc_worker';
const quizzes = ['whichenglish', 'verbcorner'];

// create the connection
amqp
  .connect(process.env.AMPQ_ADDRESS)
  .then(conn => {
    console.log('CREATED CONNECTION');

    // create  seperate channel for this instance of the worker
    return conn.createChannel().then(ch => {
      console.log('CREATED CHANNEL');
      winston.info('channel created');
      // on SIGINT ensure the channel is closed
      process.once('SIGINT', function() {
        conn.close();
      });

      //  create a rpc listener on both quizzed
      return Promise.all(
        quizzes.map(quizName => {
          const rpc_queue = quizName + DB_RPC_WORKER;
          const write_queue = quizName + DB_WRITE_QUEUE;
          winston.info('in promise all');
          // name of the queue
          // this queue is not marked as durable, as it is an rpc
          // if rabbitmq goes down, theres really nothing to replyTo
          let durable = false;
          console.log('asserting queue', rpc_queue, 'durable', durable);
          return ch
            .assertQueue(rpc_queue, { durable })
            .then(() => {
              winston.info('queue asserted', rpc_queue);
              // set the maximum amount of messages that can be waiting before this channel accepts more
              // more info here http://www.squaremobius.net/amqp.node/channel_api.html#channel_prefetch
              ch.prefetch(1);
              // consume on the specific queue
              return ch.consume(rpc_queue, msg => {
                // parse the message into a javascript object
                const rpc = JSON.parse(msg.content.toString('utf8'));
                const method = `${quizName}.${rpc.method}`;
                winston.log('db_rpc_worker', { rpc });
                winston.log('correlation_id', msg.correlationId);
                winston.log('routing_key', msg.routingKey);
                winston.log('reply_to', msg.replyTo);
                winston.log('method', method);


                //  check that this method is defined on the Worker
                if (typeof Worker[method] === 'undefined') {
                  winston.error(rpc);
                  // throw an error otherwise
                  // TODO: put this in a seperate queue of bad messages.
                  // possible dead letter exchange: http://www.rabbitmq.com/dlx.html
                  throw new Error(
                    `This method ${method} is not defined on the worker`
                  );
                }
                // call the Worker with the defined method
                return Worker[method]
                  .apply(Worker, rpc.arguments)
                  .then(data => {
                    winston.info('Worker result', data);
                    // send to the queue with the original replyTo,
                    // pass it back with the correlation ID given
                    // winston.info('replyTo', msg.properties.replyTo)
                    // winston.info('correlationId', msg.properties.correlationId);
                    ch.sendToQueue('rob', new Buffer('garbage'));
                    ch.sendToQueue(
                      msg.properties.replyTo,
                      new Buffer(JSON.stringify(data)),
                      { correlationId: msg.properties.correlationId }
                    );
                    // acknowledge receipt
                    ch.ack(msg);
                  });
              });
            })
            .then(() => {
              // this queue is marked as durable, we want DB writes to persist through a rabbitmq crash
              durable = false;
              winston.info('asserting queue', write_queue, 'durable', durable);
              return ch.assertQueue(write_queue, { durable }).then(() => {
                winston.log('queue asserted', write_queue);
                ch.prefetch(1);
                return ch.consume(write_queue, msg => {
                  winston.info('DB WRITE QUEUE', msg.content.toString('utf8'));
                  const rpc = JSON.parse(msg.content.toString('utf8'));
                  // Data is returned but not used for anything
                  const method = `${quizName}.${rpc.method}`;
                  winston.info('method', method)
                  return Worker[method]
                    .apply(Worker, rpc.arguments)
                    .then(data => {
                      winston.info('was saved in db', data);
                      return ch.ack(msg);
                    });
                });
              });
            });
        })
      ).then(() => {
        winston.info('All queues executued');
      });
    });
  })
  .catch(err => {
    console.log(err.stack);
    winston.error(err.message);
  });

// winston.handleExceptions(winston.transports);
