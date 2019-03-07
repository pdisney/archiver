const URL = require('url');

const link_extractor = require('../libs/link_extractor/link_extractor');
const UrlDocument = require('./URLDocument');
const RabbitPublisher = require('../libs/rabbitmq/RabbitPublisher');
const URLContinuationDocument = require('./URLContinuationDocument');
const RECORDLIMIT = 5000;

//const FileSaver = require('./FileSaver');
//const S3Saver = require('./S3Saver');
//const AzureImageRetriever = require('../libs/AzureImageRetriever');
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


var getFirstRecords = async (section, query, params, domain, url, timestamp, filesaver) => {
    try {
        console.debug("Getting Records for", section, url);
        var offsetquery = getOffsetQuery(query, params, 0);

        var results = await Promise.all([
            getTotal(query, params),
            global.db_connector.query(offsetquery.query, offsetquery.params)
        ]);

        var total = results[0];
        var records = results[1];
        console.debug(section, "Total", total, "for", url);

        if (total > RECORDLIMIT) {
            console.info("Starting Continuation Generator", section, total, url);
            var document = new UrlDocument(domain, url, timestamp, [], "", [], []
            , [], [], []);
            var msg = {};
            msg.section = section;
            msg.query = query;
            msg.params = params;
            msg.total = total;
            msg.document = document;
            var publisher = new RabbitPublisher(global.mq_connector);
            await publisher.publish(global.queues.continuation_generator, msg);
        }
        return records;
    } catch (err) {
        console.error(err);
        throw err;
    }
}


var getTotal = async (query, params) => {
    try {
        var re = /.*SELECT\s+(.*)\s+FROM.*/i;
        var coulumn_replace = query.replace(re, "$1");
        query = query.replace(coulumn_replace, 'count(*)');
        var res = /ORDER BY.*/i;
        query = query.replace(res, '');
        var tokens = query.split('$');

        var newparams = [];
        for (var i = 0; i < tokens.length - 1; i++) {
            newparams.push(params[i]);
        }

        var rows = await global.db_connector.query(query, newparams);

        var total = rows[0].count;
        return total;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

var getOffsetQuery = (query, params, offset) => {
    try {
        var newParams = params.slice();

        newParams.push(offset);
        newParams.push(RECORDLIMIT);

        var off_idx = newParams.length - 1;
        var lim_idx = newParams.length;
        query += " OFFSET $" + off_idx + " LIMIT $" + lim_idx;
        return { "query": query, "params": newParams };
    } catch (err) {
        console.error(err);
        throw err;

    }
}


var getUrlData = async (url_id) => {
    try {
        var query = "SELECT url, html, age_off as timestamp FROM urls WHERE id = $1";
        var params = [url_id];
        var rows = await global.db_connector.query(query, params);

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

var getOcr = async (url_id, domain, url, timestamp) => {
    try {
        var query = "SELECT url, ocr, preprocess_algorithm, age_off as timestamp FROM images WHERE url_id = $1 ORDER BY url";
        var params = [url_id];
        return await getFirstRecords("ocr", query, params, domain, url, timestamp);

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

var getEntities = async (url_id, domain, url, timestamp) => {
    var results = await Promise.all([getEntityRecords(url_id, domain, url, timestamp),
    getPropertyRecords(url_id, domain, url, timestamp)]);
    var records = results[0].concat(results[1]);

    return records;
}
var getEntityRecords = async (url_id, domain, url, timestamp) => {
    try {
        var query = "SELECT type, value, age_off as timestamp FROM url_entities WHERE url_id = $1"
        var params = [url_id];
        return await getFirstRecords("entities", query, params, domain, url, timestamp);

    } catch (err) {
        console.error(err);
        throw err;
    }
}
var getPropertyRecords = async (url_id, domain, url, timestamp) => {
    try {
        var query = "SELECT type, value, age_off as timestamp FROM url_properties WHERE url_id = $1"
        var params = [url_id];
        return await getFirstRecords("entities", query, params, domain, url, timestamp);
    } catch (err) {
        console.error(err);
        throw err;
    }
}
var getProductRecords = async (url_id, domain, url, timestamp) => {
    try {
        var query = "SELECT type, name, price, dosage, quantity, age_off as timestamp FROM url_drug_relationships WHERE url_id = $1"
        var params = [url_id];
        return await getFirstRecords("products", query, params, domain, url, timestamp);
    } catch (err) {
        console.error(err);
        throw err;
    }
}


var getRelationships = async (domain_id, domain, url, timestamp) => {
    try {
        var results = await Promise.all([
            getRedirects(domain_id, domain, url, timestamp),
            getActiveScrape(domain_id, domain, url, timestamp),
            getProcessorRelationships(domain_id, domain, url, timestamp)
        ]);
        var records = results[0].concat(results[1]);
        records = records.concat(results[3]);


        return records;
    } catch (err) {
        console.error(err);
        throw err;
    }
}


var getRedirects = async (domain_id, domain, url, timestamp) => {
    try {
        var query = "SELECT  url_source as source_url, url_redirect as endpoint_url, 'redirect' as type, age_off as timestamp FROM url_redirects WHERE url_source = $1 AND domain_id = $2"
        var params = [url, domain_id];
        return await getFirstRecords("relationships", query, params, domain, url, timestamp);
    } catch (err) {
        console.error(err);
        throw err;
    }
}
var getActiveScrape = async (domain_id, domain, url, timestamp) => {
    try {

        var query = "SELECT  origin_url as source_url, endpoint_url, pattern_type as type, age_off as timestamp FROM url_active_scrape WHERE origin_url = $1 AND domain_id = $2 AND pattern_type <> $3"
        var params = [url, domain_id, 'landing'];

        return await getFirstRecords("relationships", query, params, domain, url, timestamp);
    } catch (err) {
        console.error(err);
        throw err;
    }
}
var getProcessorRelationships = async (domain_id, domain, url, timestamp) => {
    try {
        var query = "SELECT source_url, processor_url as endpoint_url, processor_type as type, capture_date as timestamp FROM processor_relationships WHERE source_url = $1 AND domain_id = $2"
        var params = [url, domain_id];

        return await getFirstRecords("relationships", query, params, domain, url, timestamp);
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
       // this.filesaver = new FileSaver();

        return this;
    }



    createDocument() {
        return (async () => {
            try {
                var urldata = await getUrlData(this.url_id);
                var domain = getHostName(urldata.url);

                var result = await Promise.all([
                    getIpAddress(this.domain_id),
                    getOcr(this.url_id, domain, urldata.url, urldata.timestamp),
                    getEntities(this.url_id, domain, urldata.url, urldata.timestamp),
                    getProductRecords(this.url_id, domain, urldata.url, urldata.timestamp),
                    getRelationships(this.domain_id, domain, urldata.url, urldata.timestamp),
                    link_extractor.getAllLinks(urldata.url, urldata.html)
                ])


                var ipAddresses = result[0];

                var ocr = result[1];
                 var entities = result[2];
                var products = result[3];
                var relationships = result[4];
                var links = result[5];

                var document = new UrlDocument(domain, urldata.url, urldata.timestamp,
                    ipAddresses, urldata.html, ocr,
                    entities, products, relationships, links);

                var time = Date.now().toString();
                var timestamp = new Date(document.timestamp).toISOString().substring(0, 10);
                var filename = domain + "/" + domain + "_" + timestamp + "_" + time + ".json";
                //var filename = domain + "_" + timestamp + "_" + time + ".json";
                var publisher = new RabbitPublisher(global.mq_connector);
                var msg = {};
                msg.filename = filename;
                msg.document = document;
                await publisher.publish(global.queues.saver, msg);
               // await global.AzureUpload.saveDocument(filename, document);
                //await this.filesaver.saveDocument(document, filename);


                if (ocr.length > 0) {
                    var msg = {};
                    msg.harvest_id = this.harvest_id;
                    msg.domain = domain;
                    msg.url = urldata.url;
                    msg.timestamp = timestamp;
                    msg.ocr = ocr;
                    msg.time = time;
                    await this.publisher.publish(global.queues.image_archive, msg);
                  
                }

                return document;
            } catch (err) {
                console.error(err);
                throw err;
            }
        })();
    }











}


module.exports = DocumentManager;

module.exports.getOffsetQuery=getOffsetQuery;
