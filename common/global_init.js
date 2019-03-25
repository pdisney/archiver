const PostgresqlConnector = require('../libs/PostgresqlConnector')
const RabbitConnector = require("../libs/rabbitmq/RabbitConnector");
const RabbitPublisher = require('../libs/rabbitmq/RabbitPublisher');
const loggingInit = require('../libs/winston/loginit');
const HtmlAnalyzer = require('@pdisney1/htmlanalyzer/HtmlAnalyzer');

var globalInit = async () => {
  try {
    global.config = {};
    await loggingInit.loggingInit();
    await appInit();
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
  global.config.mq_address = process.env.MQ_ADDRESS;
  global.mq_connector = await new RabbitConnector(global.config.mq_address);
  global.publisher = new RabbitPublisher(global.mq_connector);
  global.queues = {};
  global.queues.url_archive = 'url_archive_process';
  global.queues.harvest_archive = 'harvest_archive_process';
  global.queues.image_archive = 'image_archive_process';
  global.queues.section_continuation = 'section_continuation_process';
  global.queues.continuation_generator = 'continuation_generator';
  global.queues.saver = 'saver';

  console.info("MQ Client Initialized", global.config.mq_address);
  return;
};


var azureStorageInit =  () => {
  const AzureBlobWrapper = require('../libs/AzureBlobWrapper');
  
  const azureCoolStorageAccount = process.env.AZURECOOLSTORAGEACCOUNT;
  const azureCoolKey = process.env.AZURECOOLKEY;
  global.AzureCoolContainer = process.env.AZURECOOLCONTAINER;

  global.azureCool = new AzureBlobWrapper(azureCoolStorageAccount,azureCoolKey);
  
  console.info("AZURE Storage Client Inititialized");
}

azureImageInit = ()=>{
  const AzureBlobWrapper = require('../libs/AzureBlobWrapper');
  const SteelgateImages = require('../libs/SteelgateImages');
  
  const azureImageStorageAccount = process.env.AZUREIMAGESTORAGEACCOUNT;
  const azureImageKey = process.env.AZUREKEY;
 
  global.AzureImageGeneralContainer = process.env.AZUREGENERALIMAGECONTAINER;
  
  global.azureImage = new AzureBlobWrapper(azureImageStorageAccount,azureImageKey);
  global.steelgateImages = new SteelgateImages();

  console.info("AZURE Image Client Inititialized");
}


var awsInit = async () => {
  global.SecretKey = process.env.SECRETKEY;
  global.AccessKey = process.env.ACCESSKEY;
  global.S3Bucket = process.env.BUCKET;
  global.Region = process.env.REGION;
}



var appInit = async () => {
  if (!global.config) {
    global.config = {};
  }
  global.config.log_location = process.env.LOG_LOCATION || "file";
  global.config.log_location = global.config.log_location.toLowerCase();
  global.config.result_directory = __dirname + "/../results/";
  global.config.tag_limit = process.env.TAG_LIMIT || 1000;
  global.config.html_char_limit = process.env.HTML_CHAR_LIMIT || 2000000;

  global.html_analyzer = new HtmlAnalyzer();

  console.info("General App Initialized");

  return;
}


module.exports.globalInit = globalInit;
module.exports.azureStorageInit = azureStorageInit;
module.exports.azureImageInit = azureImageInit;
module.exports.databaseInit = databaseInit;
module.exports.appInit = appInit;

