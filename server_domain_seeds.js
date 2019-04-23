const global_init = require('./common/global_init.js');
const RabbitConsumer = require('./libs/rabbitmq/RabbitConsumer');


var onMessage = async (data, done) => {
  try {
    console.info(data);
    var query = "SELECT name, description as html, search_tool, url, date_added, is_olp, olp_status, olp_status_last_updated, olp_probability, olp_model, http_status, http_status_last_updated, detected_language FROM domain_seeds ORDER BY name OFFSET $1 LIMIT $2;"
    var params = [data.offset, data.limit];
    var result = await global.db_connector.query(query, params);

    await global.azureCool.uploadBlobStream(global.AzureCoolContainer, data.name, result, "application/json");

    done();
  } catch (err) {
    console.error(err);
    done();
  }
};


var main = async () => {
  try {
    await global_init.globalInit();
    await global_init.databaseInit();
    await global_init.azureStorageInit();


    await new RabbitConsumer(global.mq_connector, global.queues.domain_seed, onMessage);

    return;
  } catch (err) {
    console.error(err);
    throw err;
  }

};

main();











