const RabbitPublisher = require('../libs/rabbitmq/RabbitPublisher');
const fs = require("fs");

var getPath = (type, id) => {
    return __dirname + "/../state/" + type + id;
}

var readFile = (path) => {
    return new Promise((resolve, reject) => {
        fs.readFile(path, (err, data) => {
            if (err) {
                return reject(err);
            }
            return resolve(data.toString());

        });
    })
}
var writeFile = (path, data) => {
    return new Promise((resolve, reject) => {
        console.info("DATA", data);
        fs.writeFile(path, data, (err) => {
            if (err) {
                console.error(err);
                return reject(err);
            }
            return resolve();

        });
    })
}


var getOffset = async (type, id) => {
    var offset = 0;
    try {
        var path = getPath(type, id);
        offset = await readFile(path);
        console.info("Offset", type, id, offset);
        return parseInt(offset);
    } catch (err) {
        console.error(err);
        return 0;
    }
}

var setOffset = async (type, id, offset) => {
    try {
        var path = getPath(type, id);
        await writeFile(path, offset);

    } catch (err) {
        console.error(err);
    }
}


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

                var offset = await getOffset('hv', '');

                var query = "SELECT id FROM harvests ORDER BY id"

                query += " OFFSET $1";

                var params = [offset];

                var harvests = await global.db_connector.query(query, params);
                this.total = harvests.length;
                for (var i = 0; i < harvests.length; i++) {
                    var harvest_id = harvests[i].id;
                    this.current = i + 1;
                    this.currentHarvest = harvest_id;
                    await rabbitpublisher.publish(global.queues.harvest_archive, { "harvest_id": harvest_id });
                    await setOffset('hv', '', this.current+offset);
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
                var rabbitpublisher = new RabbitPublisher(global.mq_connector);
                this.currentHarvest = harvest_id;
                var offset = await getOffset('hv', this.currentHarvest);

                var query = "SELECT urls.id as url_id, domains.domain_id, domains.harvest_id  FROM urls INNER JOIN(SELECT domains.id as domain_id, harvest_id FROM domains WHERE harvest_id = $1)domains ON domains.domain_id = urls.domain_id ORDER BY urls.id OFFSET $2;"

                var params = [harvest_id, offset];
                var urls = await global.db_connector.query(query, params);
                this.urls = urls.length;

                for (var x = 0; x < urls.length; x++) {
                    this.currentUrl = x + 1;
                    var url = urls[x];

                    await rabbitpublisher.publish(global.queues.url_archive, url);
                    await setOffset('hv', this.currentHarvest, this.currentUrl+offset);
                }
            } catch (err) {
                console.error(err);
                throw err;
            }
        })()
    }


    progress() {
        if (this.total !== 0) {
            var message = "Processing Harvest " + this.current + " of " + this.total + ".";
        } else {
            var message = "Processing Harvest " + this.currentHarvest + ".";
            if (this.currentUrl === 0 && this.urls === 0) {
                message += " Querying urls for harvest " + this.currentHarvest + ".";
            } else {
                message += " Processing url " + this.currentUrl + " of " + this.urls;
            }
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