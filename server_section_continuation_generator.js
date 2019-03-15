const global_init = require('./common/global_init.js');
const RabbitConsumer = require('./libs/rabbitmq/RabbitConsumer');
const URLContinuationDocument = require('./processors/URLContinuationDocument');
const DocumentManager = require('./processors/DocumentManager');
const RECORDLIMIT = 5000;



var onMessage = async (data, done) => {
  try {

    await sectionContinuation(data.section, data.query, data.params, RECORDLIMIT, data.total, data.document);

    done();
  } catch (err) {
    console.error(err);
    done();
  }
};

var sectionContinuation = async (section, query, params, offset, total, document) => {
  try {
    if (offset < total) {
      var offsetquery = DocumentManager.getOffsetQuery(query, params, offset);
      var msg = new URLContinuationDocument(offsetquery.query, offsetquery.params, document, section);
      await global.publisher.publish(global.queues.section_continuation, msg);
      offset = offset + RECORDLIMIT;
      console.info("Continuation message Published",section, document.url, offset, "of",total);

      await sectionContinuation(section, query, params, offset, total, document);
    }
  } catch (err) {
    console.error(err);
    throw err;
  }

}


var main = async () => {
  try {
    await global_init.globalInit();
  
    await new RabbitConsumer(global.mq_connector, global.queues.continuation_generator, onMessage);

    return;
  } catch (err) {
    console.error(err);
    throw err;
  }

};

main();











