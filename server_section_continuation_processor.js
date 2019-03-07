const global_init = require('./common/global_init.js');
const RabbitConsumer = require('./libs/rabbitmq/RabbitConsumer');
const RabbitPublisher = require('./libs/rabbitmq/RabbitPublisher');
var publisher;

var onMessage = async (data, done) => {
  try {

    var records = await global.db_connector.query(data.query, data.params);
    var document = data.document;
    document[data.section] = records;
    var msg = {};
    msg.filename = data.filename;
    msg.document = document;
    await publisher.publish(global.queues.saver, msg);


    done();
  } catch (err) {
    console.error(err);
    done();
  }
};





var main = async () => {
  try {
    await global_init.globalInit();
    await global_init.databaseInit();
    publisher = new RabbitPublisher(global.mq_connector);

    await new RabbitConsumer(global.mq_connector, global.queues.section_continuation, onMessage);

    return;
  } catch (err) {
    console.error(err);
    throw err;
  }

};

main();











