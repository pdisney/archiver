const global_init = require('./common/global_init.js');
const RabbitConsumer = require('./libs/rabbitmq/RabbitConsumer');
const UrlImageDocument = require('./processors/URLImageDocument');

const MAX_IMGES = 10;




var getImages = async (ocr_data, harvest_id) => {
  try {
   
    var images = [];
    var image_url;
    for (var i = 0; i < ocr_data.length; i++) {
      var record = ocr_data[i];
      if (!image_url || image_url !== record.url) {
        image_url = record.url;
        var image = await global.steelgateImages.getBase64Image(image_url, harvest_id);
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

var createImageDocument = async (images, url, domain, timestamp, time, index) => {
  try {
    
    if (images.length > MAX_IMGES) {
      
      var sliced = images.slice(0, MAX_IMGES);
      var imageDocument = new UrlImageDocument(domain, url, timestamp, sliced);
      var imagefilename = domain + "/" + domain + "_" + timestamp + "_" + time + "cont_"+index+"_images.json";
  
      console.info(domain,"image total", images.length, imagefilename);
     
      var msg = {};
      msg.filename = imagefilename;
      msg.document = imageDocument;
      await global.publisher.publish(global.queues.saver, msg);
      var remaining = images.slice(MAX_IMGES);
     
      index = index +1;
      return await createImageDocument(remaining, url, domain, timestamp, time, index);

    } else {
      var imageDocument = new UrlImageDocument(domain, url, timestamp, images);
      var imagefilename = domain + "/" + domain + "_" + timestamp + "_" + time + "_images.json";
      var msg = {};
      msg.filename = imagefilename;
      msg.document = imageDocument;
      //console.info(domain,"image total", images.length, imagefilename);
      await global.publisher.publish(global.queues.saver, msg);
    }
    return;
  } catch (err) {
    console.error(err);

  }
}


var onMessage = async (data, done) => {
  try {
    var images = await getImages(data.ocr, data.harvest_id);
    await createImageDocument(images, data.url, data.domain, data.timestamp, data.time, 1);

    done();
  } catch (err) {
    console.error(err);
   done();
  }
};


var main = async () => {
  try {
    await global_init.globalInit();
    await global_init.azureImageInit();
  
    await new RabbitConsumer(global.mq_connector, global.queues.image_archive, onMessage);

    return;
  } catch (err) {
    console.error(err);
    throw err;
  }

};

main();











