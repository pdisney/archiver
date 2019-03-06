const global_init = require('./common/global_init.js');
const RabbitConsumer = require('./libs/rabbitmq/RabbitConsumer');
const UrlImageDocument = require('./processors/URLImageDocument');

var getImages = async (ocr_data, harvest_id) => {
  try {
      var images = [];
      var image_url;
      for (var i = 0; i < ocr_data.length; i++) {
          var record = ocr_data[i];
          if (!image_url || image_url !== record.url) {
              image_url = record.url;
              var image = await global.AzureDownload.getBase64Image(image_url, harvest_id);
              if (image) {
                  images.push({ "url": image_url, "encoding": "base64", "timestamp": record.timestamp, "image": image });
              }
          }
      }
      return images;
  } catch (err) {
      console.error(err);
      throw err;
  }
}


var onMessage = async (data, done) => {
  try {
    var images = await getImages(data.ocr, data.harvest_id);
    var imageDocument = new UrlImageDocument(data.domain, data.url, data.timestamp, images);
    var imagefilename = data.domain + "/" + data.domain + "_" + data.timestamp + "_" + data.time + "_images.json";
    await global.AzureUpload.saveDocument(imagefilename, imageDocument);
    
   // console.info("Image Documents Uploaded", data.url);

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

    await new RabbitConsumer(global.mq_connector, global.queues.image_archive, onMessage);

    return;
  } catch (err) {
    console.error(err);
    throw err;
  }

};

main();











