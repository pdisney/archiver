const global_init = require('./common/global_init.js');
const fs = require("fs");

var getPath = () => {
    return __dirname + "/state/domain_seeds_offset";
}

var readFile = (path) => {
    return new Promise((resolve, reject) => {
        fs.readFile(path, (err, data) => {
            if (err) {
                return reject(err);
            }
            return resolve(data.toString());

        });
    })
}
var writeFile = (path, data) => {
    return new Promise((resolve, reject) => {
     
        fs.writeFile(path, data, (err) => {
            if (err) {
                console.error(err);
                return reject(err);
            }
            return resolve();

        });
    })
}


var getOffset = async () => {
    var offset = 0;
    try {
        var path = getPath();
        offset = await readFile(path);
        console.info("Offset",offset);
        return parseInt(offset);
    } catch (err) {
        console.error(err);
        console.info("returning 0");
        return 0;
    }
}

var setOffset = async (offset) => {
    try {
        var path = getPath();
        await writeFile(path, offset);

    } catch (err) {
        console.error(err);
    }
}


var sectionContinuation = async (offset, total) => {
  try {
    if (offset < total) {
      var end = offset + 10;
      var name = "domain_seeds"+"_"+offset+"_"+end+".json";

      var msg = {"name":name,"offset":offset, "limit":10};
    
      
      await global.publisher.publish(global.queues.domain_seed, msg);

      await setOffset(end);

      console.info(offset, end, total);

      await sectionContinuation(end, total);
     
    }
  } catch (err) {
    console.error(err);
    throw err;
  }

}


var main = async () => {
  try {
    await global_init.globalInit();
    await global_init.databaseInit();
    console.info("Getting Seeds");
    var count = "SELECT count(*) FROM domain_seeds;";
    var t = await global.db_connector.query(count);
    console.info(JSON.stringify(t));
    var total = t[0].count;
    console.info("count",total);

    var offset = await getOffset();

    await sectionContinuation(offset,total);

    return;
  } catch (err) {
    console.error(err);
    throw err;
  }

};

main();











