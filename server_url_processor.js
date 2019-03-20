const global_init = require('./common/global_init.js');
const RabbitConsumer = require('./libs/rabbitmq/RabbitConsumer');

var DocumentManager = require('./processors/DocumentManager');


var onMessage = async (data, done) => {
  try {
    var documentManager = new DocumentManager(data.harvest_id, data.domain_id, data.url_id);
    var document = await documentManager.createDocument();

    var time = Date.now().toString();
    var timestamp = new Date(document.timestamp).toISOString().substring(0, 10);
    var filename = document.domain + "/" + document.domain + "_" + timestamp + "_" + time + ".json";

    var msg = {};
    msg.filename = filename;
    msg.document = document;
    await global.publisher.publish(global.queues.saver, msg);
    if (document.ocr.length > 0) {
      var msg = {};
      msg.harvest_id = this.harvest_id;
      msg.domain = document.domain;
      msg.url = document.url;
      msg.timestamp = timestamp;
      msg.ocr = document.ocr;
      msg.time = time;
      await global.publisher.publish(global.queues.image_archive, msg);
    }

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
 

    await new RabbitConsumer(global.mq_connector, global.queues.url_archive, onMessage);

    return;
  } catch (err) {
    console.error(err);
    throw err;
  }

};

main();











