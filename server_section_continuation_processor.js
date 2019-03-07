const global_init = require('./common/global_init.js');
const RabbitConsumer = require('./libs/rabbitmq/RabbitConsumer');
const RabbitPublisher = require('./libs/rabbitmq/RabbitPublisher');
const URLContinuationDocument = require('./processors/URLContinuationDocument');
const DocumentManager = require('./processors/DocumentManager');
const RECORDLIMIT = 5000;

var onMessage = async (data, done) => {
  try {

    var records = await global.db_connector.query(data.query, data.params);
    var document = data.document;
    document[data.section]=records;
    await global.AzureUpload.saveDocument(data.filename, document);

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
    await global_init.azureInit();


    await new RabbitConsumer(global.mq_connector, global.queues.section_continuation, onMessage);

    return;
  } catch (err) {
    console.error(err);
    throw err;
  }

};

main();











