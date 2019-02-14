//


const expect = require('chai').expect;
const AzureStorageWrapper = require('../libs/AzureStorageWrapper');
const globalinit = require('../common/global_init');
const fs = require('fs');


var writeFile = (fullpath, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(fullpath, data, err => {
      if (err) {
        console.info(err);
        return reject(err);
      }

      return resolve();
    });
  })
}



describe('AzureStorageWrapper test', function () {
  this.timeout(720000);
  it('Test constructor', async function () {
    globalinit.appInit();
    var azure = new AzureStorageWrapper();

    var containername = 163;

    var status = await azure.checkImageDetails("https://www.eupharmacy.org/index.php?main_page=advanced_search_result&search_in_description=1&zenid=ldm7jo5vd7d3r26bjbko0i1es1&keyword=viagra", "163");

    console.info("STATUS", status);

    var output = await azure.getImageStream("https://www.eupharmacy.org/index.php?main_page=advanced_search_result&search_in_description=1&zenid=ldm7jo5vd7d3r26bjbko0i1es1&keyword=viagra", "163");

    var write = fs.createWriteStream(__dirname + '/testStream.png')
    output.pipe(write);

    output = await azure.getBase64Image("https://www.eupharmacy.org/index.php?main_page=advanced_search_result&search_in_description=1&zenid=ldm7jo5vd7d3r26bjbko0i1es1&keyword=viagra", "163");


    await writeFile(__dirname + '/testBuffer.tt', output);
    output = Buffer.from(output, 'base64');

    var object = {};
    object.image = output;

    console.info('output', output);
    await writeFile(__dirname + '/testBuffer.png', object.image);

  });

});
