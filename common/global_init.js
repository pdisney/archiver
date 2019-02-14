const PostgresqlConnector = require('../libs/PostgresqlConnector')
const RabbitConnector = require("../libs/rabbitmq/RabbitConnector");
const loggingInit = require('../libs/winston/loginit');

var globalInit = async () => {
  try {
    global.config={};
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
  global.queues={};
  global.queues.url_archive ='url_archive_process';
  
  console.info("MQ Client Initialized", global.config.mq_address);
  return;
};

  var appInit = async () => {

    global.SecretKey = process.env.SECRETKEY ;
    global.AccessKey = process.env.ACCESSKEY;
    global.S3Bucket = process.env.BUCKET;
    global.Region =  process.env.REGION;

    global.AzureKey = process.env.AZUREKEY;

    global.config.offset = process.env.OFFSET;
    global.config.limit = process.env.LIMIT;
    console.info("General App Initialized");

    return;
  }



  module.exports.globalInit = globalInit;
