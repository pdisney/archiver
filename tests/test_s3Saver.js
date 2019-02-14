const expect = require('chai').expect;
const S3Saver = require('../processors/S3Saver');
const globalInit = require('../common/global_init');



var sleep = (time) => {
    return new Promise(resolve => {
        setTimeout(() => {
            return resolve();
        }, time);
    });
}

/**
 * "save":{
       "local_file":{},
    	"azure_blob":"",
    	"aws_s3":"",
    	"mongo":"",
    	"api":"",
    	"elastic":{
    		"host":"sgelasticesarch44zcpmys4rsva-vm0.eastus2.cloudapp.azure.com:9200",
    		"index":"harvest_api_test"
        },
    	"postgres":{
            "connection_string":"postgres://admin:c1s-Adm1n@cis-reference.cloudapp.net/cis-harvest-basic",
            "statement":""
    	"rabbitmq":{
    		"host":"amqp://localhost",
    		"queue":"results"
    	}
    }
 */


describe('S3Saver', async function () {
    this.timeout(720000);
    //cover standard html error codes returned from server 
    it('File Saved to S3 Bucket', async function () {
        await globalInit.globalInit();

        var document = { "domain": "salecanadadrugs.com", "url": "http://salecanadadrugs.com/", "timestamp": "2018-10-21T04:00:00.000Z", "ipAddresses": [{ "ip_address": "92.240.237.216" }], "ocr": [] };
     
        var bucket = 'steelgate-test-bucket';
     
        var s3 = new S3Saver();

        await s3.saveDocument(document, bucket);



    });


});
