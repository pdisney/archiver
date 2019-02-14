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

var checkProgress = async()=>{
  var progress = archiver.progress();
  console.info(progress.message);
  if(progress.currentHarvest === progress.harvests){
    console.info("Processing Last Harvest");
    if(progress.currentUrl === progress.totalUrls){
      console.info("Archive Process Complete");
      return;
    }
  }else{
    await sleep(10000);
    checkProgress();
  }
}

var main = async () => {
  try {
    await global_init.globalInit();
    checkProgress();
    await archiver.archive(global.config.offset, global.config.limit);
  } catch (err) {
    console.error(err);
    throw err;
  }

};

main();











