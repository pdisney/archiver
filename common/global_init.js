const PostgresqlConnector = require('../libs/PostgresqlConnector')
const RabbitConnector = require("../libs/rabbitmq/RabbitConnector");
const loggingInit = require('../libs/winston/loginit');
const AzureStorageWrapper = require('../libs/AzureStorageWrapper');
const AzureBlobSaver = require('../processors/AzureBlobSaver');

var globalInit = async () => {
  try {
    global.config = {};
    await loggingInit.loggingInit();
    await appInit();
    await databaseInit();
    await mqInit();

    return;
  } catch (err) {
    throw err;
  }
}


var databaseInit = async () => {
  global.harvest_dbstring = process.env.HARVEST_DATABASE_CONNECTION;
  global.db_connector = new PostgresqlConnector(global.harvest_dbstring);
  console.info("Database Config Initialized", global.harvest_dbstring);
  return;
}


var mqInit = async () => {
  console.info("Initializing MQ Client");
  global.config.mq_address = process.env.MQ_ADDRESS
  global.mq_connector = await new RabbitConnector(global.config.mq_address);
  global.queues = {};
  global.queues.url_archive = 'url_archive_process';
  global.queues.harvest_archive = 'harvest_archive_process';

  console.info("MQ Client Initialized", global.config.mq_address);
  return;
};

var appInit = async () => {
  if (!global.config) {
    global.config = {};
  }
  global.SecretKey = process.env.SECRETKEY;
  global.AccessKey = process.env.ACCESSKEY;
  global.S3Bucket = process.env.BUCKET;
  global.Region = process.env.REGION;

  global.AzureKey = process.env.AZUREKEY;
  global.AzureCoolKey = process.env.AZURECOOLKEY;
  global.AzurecoolBucket = process.env.AZURECOOLBUCKET;

  global.AzureDownload =  new AzureStorageWrapper();
  global.AzureUpload = new AzureBlobSaver();

  console.info("General App Initialized");

  return;
}


module.exports.globalInit = globalInit;
module.exports.appInit = appInit;
