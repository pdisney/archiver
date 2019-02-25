const global_init = require('./common/global_init.js');
const RabbitConsumer = require('./libs/rabbitmq/RabbitConsumer');
const Archiver = require('./processors/Archiver');

var sleep = (time) => {
  return new Promise(resolve => {
    setTimeout(() => {
      return resolve();
    }, time);
  });
}

var checkProgress = async (archiver) => {
  var progress = archiver.progress();
  console.info(progress.message);
  if (progress.totalUrls !== 0 && progress.currentUrl === progress.totalUrls) {
    console.info("URL Archive Process Complete");
    return;

  } else {
    await sleep(10000);
    checkProgress(archiver);
  }
}

//Recieves a message for each harvest ID.  This allows the collection of URLs for each Harvest to be parallelized.
var onMessage = async (data, done) => {
  try {
    var archiver = new Archiver();
    checkProgress(archiver);
    await archiver.generateUrlArchive(data.harvest_id);

    done();
  } catch (err) {
    console.error(err);
    done();
  }
};

var main = async () => {
  try {
    await global_init.globalInit();
    await new RabbitConsumer(global.mq_connector, global.queues.harvest_archive, onMessage);
    return;
  } catch (err) {
    console.error(err);
    throw err;
  }

};

main();











