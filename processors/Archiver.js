const RabbitPublisher = require('../libs/rabbitmq/RabbitPublisher');

class Archiver {
    constructor() {
        this.total = 0;
        this.current = 0;
        this.currentHarvest = 0;
        this.urls = 0;
        this.currentUrl = 0;


    }
    generateHarvestArchive() {
        return (async () => {
            try {
                var rabbitpublisher = new RabbitPublisher(global.mq_connector);

                var query = "SELECT id FROM harvests ORDER BY id"
              
                var harvests = await global.db_connector.query(query);
                this.total = harvests.length;
                for (var i = 0; i < harvests.length; i++) {
                    var harvest_id = harvests[i].id;
                    this.current = i + 1;
                    this.currentHarvest = harvest_id;
                    await rabbitpublisher.publish(global.queues.harvest_archive, { "harvest_id": harvest_id });
                }
            } catch (err) {
                console.error(err);
                throw err;
            }

        })();
    }

    generateUrlArchive(harvest_id) {
        return (async () => {
            try {
                this.currentHarvest = harvest_id;
                query = "SELECT urls.id as url_id, domains.domain_id, domains.harvest_id  FROM urls INNER JOIN(SELECT domains.id as domain_id, harvest_id FROM domains WHERE harvest_id = $1)domains ON domains.domain_id = urls.domain_id order by urls.id;"
                var params = [harvest_id];
                var urls = await global.db_connector.query(query, params);
                this.urls = urls.length;

                for (var x = 0; x < urls.length; x++) {
                    this.currentUrl = x + 1;
                    var url = urls[x];

                    await rabbitpublisher.publish(global.queues.url_archive, url);
                }
            } catch (err) {
                console.error(err);
                throw err;
            }
        })()
    }


    progress() {
        if(this.total!==0){
            var message = "Processing Harvest " + this.current + " of " + this.total + ".";
        }else{
            var message = "Processing Harvest "+ this.currentHarvest +".  Processing url " + this.currentUrl + " of " + this.urls
        }
        var output = {};
        output.message = message;
        output.totalHarvests = this.total;
        output.currentHarvest = this.currentHarvest;
        output.currentUrl = this.currentUrl;
        output.totalUrls = this.urls;
        return output;

    }



}

module.exports = Archiver;