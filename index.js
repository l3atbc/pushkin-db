const amqp = require('amqplib');
const winston = require('winston');
const Worker = require('./worker');

const DB_WRITE_QUEUE = 'db_write';
const DB_RPC_WORKER = 'db_rpc_worker';

  // create the connection
amqp.connect(process.env.AMPQ_ADDRESS).then((conn) => 
  // create  seperate channel for this instance of the worker
   conn.createChannel().then(ch => {
    // on SIGINT ensure the channel is closed
     process.once('SIGINT', function() {
       conn.close();
     });

    // name of the queue
    // this queue is not marked as durable, as it is an rpc
    // if rabbitmq goes down, theres really nothing to replyTo
     let ok = ch.assertQueue(DB_RPC_WORKER, { durable: false }).then(() => {
      // set the maximum amount of messages that can be waiting before this channel accepts more
      // more info here http://www.squaremobius.net/amqp.node/channel_api.html#channel_prefetch
       ch.prefetch(1);
      // consume on the specific queue
       return ch.consume(DB_RPC_WORKER, (msg) => {
        // parse the message into a javascript object
         const rpc = JSON.parse(msg.content.toString('utf8'));
         winston.log('db_rpc_worker', { rpc });
         winston.log('correlation_id', msg.correlationId);
         winston.log('routing_key', msg.routingKey);
         winston.log('reply_to', msg.replyTo);


        //  check that this method is defined on the Worker
         if (typeof Worker[rpc.method] === 'undefined') {
           winston.error(rpc);
          // throw an error otherwise
          // TODO: put this in a seperate queue of bad messages.
          // possible dead letter exchange: http://www.rabbitmq.com/dlx.html
           throw new Error(`This method ${rpc.method} is not defined on the worker`);
         }
        // call the Worker with the defined method
         return Worker[rpc.method].apply(Worker, rpc.arguments).then((data) => {
           winston.log('Worker result', data);
          // send to the queue with the original replyTo, 
          // pass it back with the correlation ID given
           ch.sendToQueue(
            msg.properties.replyTo,
            new Buffer(JSON.stringify(data)),
            { correlationId: msg.properties.correlationId }
          );
          // acknowledge receipt
           ch.ack(msg);
         });
       });
     });
    // this queue is marked as durable, we want DB writes to persist through a rabbitmq crash
     ok = ok.then(() => {
       return ch.assertQueue(DB_WRITE_QUEUE, { durable: true }).then(() => {
         ch.prefetch(1);
         return ch.consume(DB_WRITE_QUEUE, (msg) => {
           winston.info('DB WRITE QUEUE', msg.content.toString('utf8'))
           const rpc = JSON.parse(msg.content.toString('utf8'));
          // Data is returned but not used for anything
           return Worker[rpc.method].apply(Worker, rpc.arguments).then(data => {
             winston.info('was saved in db', data);
             return ch.ack(msg);
           });
         });
       });
     });

     return ok.then((ch) => {
       winston.log(' [x] Awaiting requests');
     });
   }));

// winston.handleExceptions(winston.transports);
