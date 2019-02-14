const global_init = require('./common/global_init.js');
const RabbitConsumer = require('./libs/rabbitmq/RabbitConsumer');
const DocumentManager = require('./processors/DocumentManager');



var onMessage = async (data, done) => {
  try {
    var documentManager = new DocumentManager(data.harvest_id, data.domain_id, data.url_id);

    await documentManager.createDocument();

    done();
  } catch (err) {
    console.error(err);
    done();
  }
};

var main = async () => {
  try {
    await global_init.globalInit();
    console.info(global.SecretKey, global.AccessKey);
    await new RabbitConsumer(global.mq_connector, global.queues.url_archive, onMessage);
    return;
  } catch (err) {
    console.error(err);
    throw err;
  }

};

main();











