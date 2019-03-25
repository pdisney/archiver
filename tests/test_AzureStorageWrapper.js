const expect = require('chai').expect;
const globalinit = require('../common/global_init');
const fs = require('fs');

var path = __dirname + '/testStream.png';
var path1 = __dirname + '/testBuffer.tt';
var path2 = __dirname + '/testBuffer.png';

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



var getFile = (path) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, file) => {
      if (err) {
        console.error(err);
        return reject(err);
      }
      return resolve(file.toString());
    })
  })
}
var removeFile = (path) => {
  return new Promise((resolve, reject) => {
    fs.unlink(path, (err) => {
      if (err) {
        console.error(err);
        return resolve();
      }
      return resolve();
    })
  })
}




describe('AzureBlobRetriever test', function () {
  this.timeout(720000);

  
    it('Test SteelgateImages checkImageDetails', async function () {
      await globalinit.azureImageInit();
  
      var containername = 163;
  
      var status = await global.steelgateImages.checkImageDetails("https://www.eupharmacy.org/index.php?main_page=advanced_search_result&search_in_description=1&zenid=ldm7jo5vd7d3r26bjbko0i1es1&keyword=viagra", "163");
  
      console.info("STATUS", status);
  
      expect(status.exists).to.be.eql(true);
  
  
    });
  
    it('Test SteelgateImages getImageStream', async function () {
      await globalinit.azureImageInit();
  
      var containername = 163;
  
  
  
      var output = await global.steelgateImages.getImageStream("https://www.eupharmacy.org/index.php?main_page=advanced_search_result&search_in_description=1&zenid=ldm7jo5vd7d3r26bjbko0i1es1&keyword=viagra", "163");
  
      var write = fs.createWriteStream(path);
      output.pipe(write);
  
  
      write.on('finish', async () => {
        var img = await getFile(path);
        expect(img.length).to.be.eql(590816);
        removeFile(path);
  
      });
  
    });
  
  
    it('Test SteelgateImages getBase64Image', async function () {
      await globalinit.azureImageInit();
  
  
      var containername = 163;
  
      var output = await global.steelgateImages.getBase64Image("https://www.eupharmacy.org/index.php?main_page=advanced_search_result&search_in_description=1&zenid=ldm7jo5vd7d3r26bjbko0i1es1&keyword=viagra", "163");
  
  
      await writeFile(path1, output);
      output = Buffer.from(output, 'base64');
  
      var object = {};
      object.image = output;
  
      console.info('output', output);
      await writeFile(path2, object.image);
  
      var file = await getFile(path1);
      var img = await getFile(path2);
  
  
  
      expect(file.length).to.be.eql(833384);
  
      expect(img.length).to.be.eql(590816);
  
      removeFile(path1);
      removeFile(path2);
  
  
  
    });
  
  
  
    it('Test AzureBlobWrapper getBlob', async function () {
      await globalinit.azureStorageInit();
  
      var output = await global.azureCool.getBlob(global.AzureCoolContainer, "www.naturallysource.com/www.naturallysource.com_2017-08-25_1553265851688_images.json");
      output = JSON.parse(output);
  
  
      var length = output.images.length;
  
      for (var i = 0; i < length; i++) {
        var img = output.images[i];
        var p = __dirname + '/image_' + i + '.png';
        var buff = Buffer.from(img.image, img.encoding);
        await writeFile(p, buff);
      }
  
  
    });
  
  

  it('Test AzureBlobWrapper getBlobsByPrefix', async function () {
    await globalinit.azureStorageInit();
    var prefix =  'canadadrugs'

    var blobs = await global.azureCool.getBlobsByPrefix(global.AzureCoolContainer, prefix, 10);
   
    var images = [];
    for (var i = 0; i < blobs.length; i++) {
      var name = blobs[i];
      if (name.indexOf('_images.json') !== -1){
        var blob = await global.azureCool.getBlob(global.AzureCoolContainer, name);
        blob = JSON.parse(blob);
        console.log(name, blob.images.length);
        images = images.concat(blob.images);
      }
      
    }

     var length = images.length;
 
     for (var i = 0; i < length; i++) {
       var img = images[i];
       var p = __dirname + '/image_' + i + '.png';
       var buff = Buffer.from(img.image, img.encoding);
       await writeFile(p, buff);
     }

     expect(blobs.length).to.be.eql(10);
  });


});
