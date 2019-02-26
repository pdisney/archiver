const URL = require('url');

const link_extractor = require('../libs/link_extractor/link_extractor');
const UrlDocument = require('./URLDocument');
const RabbitPublisher = require('../libs/rabbitmq/RabbitPublisher');
//const S3Saver = require('./S3Saver');
//const AzureStorageWrapper = require('../libs/AzureStorageWrapper');
//const AzureBlobSaver = require('./AzureBlobSaver');
/**
 * images -
 *      tables: columns
 *          images : url_id, url, ocr, preprocess_algorithm
 * entities -
 *      tables: colums
 *          url_drug_relationships: url_id, type, name, price, dosage, quantity
 *          url_entities: url_id, type, value
 *          url_properties: url_id, type, value
 * relationships - 
 *       tables: colums
 *           url_redirects : url_source, url_redirect, domain_id, url_id
 *           url_active_scrape: origin_url, endpoint_url, pattern_type, domain_id, url_id
 *          processor_relationships : source_url, processor_url, processor_type, domain_id
 */
var getUrlData = async (url_id) => {
    try {
     //   var start = Date.now();
        var query = "SELECT url, html, age_off as timestamp FROM urls WHERE id = $1";
        var params = [url_id];
        var rows = await global.db_connector.query(query, params);
      //  var end = Date.now();
      //  var elapsedTime = (end - start) / 1000;
     //   console.info("URL Data Collection Time:", elapsedTime, " sec");

        return rows[0];
    } catch (err) {
        console.error(err);
        throw err;
    }
}

var getIpAddress = async (domain_id) => {
    try {

        var query = "SELECT ip_address FROM domains WHERE id = $1";
        var params = [domain_id];

        return await global.db_connector.query(query, params);
    } catch (err) {
        console.error(err);
        throw err;
    }
}

var getOcr = async (url_id, harvest_id) => {
    try {
       // var start = Date.now();
        var query = "SELECT url, ocr, preprocess_algorithm, age_off as timestamp FROM images WHERE url_id = $1 ORDER BY url";
        var params = [url_id];
        var rows = await global.db_connector.query(query, params);

      //  var end = Date.now();
      //  var elapsedTime = (end - start) / 1000;
      //  console.info("OCR Collection Time:", elapsedTime, " sec");
        // var images = await getImages(rows, harvest_id);

        return rows;// { "ocr": rows, "images": images };
    } catch (err) {
        console.error(err);
        throw err;
    }
}

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

var getEntities = async (url_id) => {
   // var start = Date.now();
    var results = await Promise.all([getEntityRecords(url_id), getPropertyRecords(url_id)]);
    var output = results[0].concat(results[1]);

  //  var end = Date.now();
 //   var elapsedTime = (end - start) / 1000;
  //  console.info("Entities Collection Time:", elapsedTime, " sec");
    return output;
}
var getEntityRecords = async (url_id) => {
    try {
      //  var start = Date.now();
        var query = "SELECT type, value, age_off as timestamp FROM url_entities WHERE url_id = $1;"
        var params = [url_id];

       // var end = Date.now();
      //  var elapsedTime = (end - start) / 1000;
      //  console.info("Entity Collection Time:", elapsedTime, " sec");
        return await global.db_connector.query(query, params);
    } catch (err) {
        console.error(err);
        throw err;
    }
}
var getPropertyRecords = async (url_id) => {
    try {
      //  var start = Date.now();
        var query = "SELECT type, value, age_off as timestamp FROM url_properties WHERE url_id = $1;"
        var params = [url_id];
      //  var end = Date.now();
       // var elapsedTime = (end - start) / 1000;
      //  console.info("Property Collection Time:", elapsedTime, " sec");
        return await global.db_connector.query(query, params);
    } catch (err) {
        console.error(err);
        throw err;
    }
}
var getProductRecords = async (url_id) => {
    try {
      //  var start = Date.now();
        var query = "SELECT type, name, price, dosage, quantity, age_off as timestamp FROM url_drug_relationships WHERE url_id = $1;"
        var params = [url_id];

       // var end = Date.now();
       // var elapsedTime = (end - start) / 1000;
       // console.info("Product Collection Time:", elapsedTime, " sec");
        return await global.db_connector.query(query, params);
    } catch (err) {
        console.error(err);
        throw err;
    }
}


var getRelationships = async (domain_id) => {
    try {
        var results = await Promise.all([
            getRedirects(domain_id),
            getActiveScrape(domain_id),
            getProcessorRelationships(domain_id)
        ]);
        var output = results[0].concat(results[1]);
        output = output.concat(results[2]);

        return output;
    } catch (err) {
        console.error(err);
        throw err;
    }
}


var getRedirects = async (domain_id) => {
    try {
      //  var start = Date.now();
        var query = "SELECT  url_source as source_url, url_redirect as endpoint_url, 'redirect' as type, age_off as timestamp FROM url_redirects WHERE domain_id = $1;"
        var params = [domain_id];
      
       // var end = Date.now();
      //  var elapsedTime = (end - start) /1000;
       // console.info("Redirect Collection Time:", elapsedTime," sec");
        return await global.db_connector.query(query, params);
    } catch (err) {
        console.error(err);
        throw err;
    }
}
var getActiveScrape = async (domain_id) => {
    try {
      // var start = Date.now();
        var query = "SELECT  origin_url as source_url, endpoint_url, pattern_type as type, age_off as timestamp FROM url_active_scrape WHERE domain_id = $1 AND pattern_type <> $2;"
        var params = [domain_id, 'landing'];
      //  var end = Date.now();
      //  var elapsedTime = (end - start) /1000;
      //  console.info("Active Scrape Collection Time:", elapsedTime," sec");
        return await global.db_connector.query(query, params);
    } catch (err) {
        console.error(err);
        throw err;
    }
}
var getProcessorRelationships = async (domain_id) => {
    try {
      //  var start = Date.now();
        var query = "SELECT source_url, processor_url as endpoint_url, processor_type as type, capture_date as timestamp FROM processor_relationships WHERE domain_id = $1;"
        var params = [domain_id];
       
        //var end = Date.now();
       // var elapsedTime = (end - start) /1000;
      //  console.info("Processor Relation Collection Time:", elapsedTime," sec");
        return await global.db_connector.query(query, params);
    } catch (err) {
        console.error(err);
        throw err;
    }
}


var getHostName = (url) => {
    var urlobj = URL.parse(url);
    return urlobj.hostname;
}

class DocumentManager {
    constructor(harvest_id, domain_id, url_id) {
        this.url_id = url_id;
        this.domain_id = domain_id;
        this.harvest_id = harvest_id;
        this.publisher = new RabbitPublisher(global.mq_connector);


        return this;
    }

    createDocument() {
        return (async () => {
            try {
               // var start = Date.now();
                var urldata = await getUrlData(this.url_id);
                var domain = getHostName(urldata.url);

                var result = await Promise.all([
                    getIpAddress(this.domain_id),
                    getOcr(this.url_id, this.harvest_id),
                    getEntities(this.url_id),
                    getProductRecords(this.url_id),
                    getRelationships(this.domain_id),
                    link_extractor.getAllLinks(urldata.url, urldata.html)
                ])


                var ipAddresses = result[0];// await getIpAddress(this.domain_id);

                var ocr = result[1];// await getOcr(this.url_id);
                //var images = result[1].images;// await getImages(ocr, this.harvest_id);
                var entities = result[2];// await getEntities(this.url_id);
                var products = result[3];// await getPProductRecords(this.url_id);
                var relationships = result[4];// await getRelationships(this.domain_id);
                var links = result[5];// await link_extractor.getAllLinks(urldata.url, urldata.html);

                var document = new UrlDocument(domain, urldata.url, urldata.timestamp,
                    ipAddresses, urldata.html, ocr,
                    entities, products, relationships, links);

                var time = Date.now().toString();
                var timestamp = new Date(document.timestamp).toISOString().substring(0, 10);
                var filename = domain + "/" + domain + "_" + timestamp + "_" + time + ".json";
                await global.AzureUpload.saveDocument(filename, document)
                if (ocr.length > 0) {
                    var msg = {};
                    msg.harvest_id = this.harvest_id;
                    msg.domain = domain;
                    msg.url = urldata.url;
                    msg.timestamp = urldata.timestamp;
                    msg.ocr = ocr;
                    msg.time = time;
                    await this.publisher.publish(global.queues.image_archive, msg);
                //    console.info("q", global.queues.image_archive);
                //    console.info("MSG", msg);
                    /* var imageDocument = new UrlImageDocument(domain, urldata.url, urldata.timestamp, images);
                     var imagefilename = domain + "/" + domain + "_" + timestamp + "_" + time + "_images.json";
                     await Promise.all([
                         global.AzureUpload.saveDocument(imagefilename, imageDocument),
                        
                     ]);*/
                }

               // var end = Date.now();
              //  var elapsedTime = (end - start) / 1000;

             //   console.info("Collection Time:", elapsedTime, " sec for ", document.url);

                return document;
            } catch (err) {
                console.error(err);
                throw err;
            }
        })();
    }











}


module.exports = DocumentManager;