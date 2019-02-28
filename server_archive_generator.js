const global_init = require('./common/global_init.js');
const Archiver = require('./processors/Archiver');
var archiver = new Archiver();

var sleep = (time) => {
  return new Promise(resolve => {
    setTimeout(() => {
      return resolve();
    }, time);
  });
}

var checkProgress = async () => {
  var progress = archiver.progress();
  console.info(progress.message, archiver.total, archiver.current, archiver.total);

  if (archiver.total !== 0 && archiver.current === archiver.total) {
    console.info("Harvest Processing Complete");
    return
  } else {
    await sleep(30000);
    checkProgress();
  }
}

var main = async () => {
  try {
    await global_init.globalInit();
    await global_init.databaseInit();
    checkProgress();
    await archiver.generateHarvestArchive();



  } catch (err) {
    console.error(err);
    throw err;
  }

};

main();











