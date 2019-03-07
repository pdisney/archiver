const global_init = require('./common/global_init.js');
const RabbitConsumer = require('./libs/rabbitmq/RabbitConsumer');


var onMessage = async (data, done) => {
  try {
    await global.AzureUpload.saveDocument(data.filename, data.document);
    done();
  } catch (err) {
    console.error(err);
    done();
  }
};



var main = async () => {
  try {
    await global_init.globalInit();
    await global_init.azureInit();  
    await new RabbitConsumer(global.mq_connector, global.queues.saver, onMessage);

    return;
  } catch (err) {
    console.error(err);
    throw err;
  }

};

main();











