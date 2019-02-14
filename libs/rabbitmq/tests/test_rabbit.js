const expect = require('chai').expect;
const RabbitConnector = require('../RabbitConnector');
const RabbitConsumer = require('../RabbitConsumer');
const RabbitPublisher = require('../RabbitPublisher');


var sleep = (time) => {
    return new Promise(resolve => {
        setTimeout(() => {
            return resolve();
        }, time);
    });
}

describe('#RabbitConnector', function () {
    this.timeout(720000);
    let rabbitconnector;
    beforeEach(async function () {
        rabbitconnector = await new RabbitConnector('amqp://localhost');
       
    });
    afterEach(async function(){
        await rabbitconnector.closeConnection();
    });

    //cover standard html error codes returned from server 
    it('Test Rabbit Connector', async function () {
        expect(rabbitconnector.connection).to.be.not.eql(null);

    });
    it('Test Rabbit retryConnection', async function () {
        await rabbitconnector.retryConnection();
        expect(rabbitconnector.connection).to.be.not.eql(null);
    });
    it('Test Rabbit closeConnection', async function () {
        await rabbitconnector.closeConnection();
        expect(rabbitconnector.connection).to.be.eql(null);
    });
    it('Test Rabbit getChannel', async function () {
        var ch = await rabbitconnector.getChannel();
        expect(ch.ch).to.be.gte(1);
    });
    it('Test Rabbit closeChannel', async function () {
        var ch = await rabbitconnector.getChannel();
        var result = await rabbitconnector.closeChannel(ch);
        expect(result).to.be.eql(1);
    });
    it('Test Rabbit createQueue', async function () {
        var creationDetails = await rabbitconnector.createQueue('url_archive');
        console.info("create url_archive", creationDetails)
        expect(creationDetails.queue).to.be.eql("url_archive");
    });

    it('Test Rabbit deleteQueue', async function () {
        var deleteDetails = await rabbitconnector.deleteQueue('url_archive');
        expect(deleteDetails.success).to.be.eql("url_archive deleted");
        await rabbitconnector.createQueue('url_archive');
    });

    it('Test Rabbit checkQueue', async function () {
        var rabbitconnector = await new RabbitConnector('amqp://localhost');

        var queueDetails = await rabbitconnector.checkQueue("url_archive");
        expect(queueDetails.queue).to.be.eql('url_archive');

    });
    it('Test Rabbit purgeQueue', async function () {
        var rabbitconnector = await new RabbitConnector('amqp://localhost');
        var purgeDetails = await rabbitconnector.purgeQueue('url_archive');
        expect(purgeDetails.messageCount).to.be.gte(0);


    });
});

describe('#RabbitPublisher', function () {
    this.timeout(720000);
    //cover standard html error codes returned from server 
    it('Message published to queue', async function () {
        var connector = await new RabbitConnector('amqp://localhost');
        var publisher = new RabbitPublisher(connector);
        var publisher1 = new RabbitPublisher(connector);

        var ok = await publisher.publish('url_archive', { "test": "test" });
        expect(ok).to.be.eql(true);

        var ok = await publisher1.publish('url_archive', { "test": "test" });
        expect(ok).to.be.eql(true);

        await connector.closeConnection();
    });
});



describe('#RabbitConsumer', function () {
    this.timeout(720000);
    let connector;
    beforeEach(async function () {
        connector = await new RabbitConnector('amqp://localhost');
        await connector.purgeQueue('url_archive');
        await connector.checkQueue("url_archive");
        var publisher = new RabbitPublisher(connector);
        await publisher.publish('url_archive', { "test": "test" });
        console.info("Test message published");
    });
    afterEach(async function(){
       await connector.closeConnection();
    });
    //cover standard html error codes returned from server 
    it('Test Rabbit Consumer', async function () {
        var test_result;
        var onMessage = async (data, done) => {
            try {
                test_result = data;
                done();
            } catch (err) {
                console.info("ERRR", err);
            }
        }
        var consumer = await new RabbitConsumer(connector, "url_archive", onMessage);
        await sleep(2000); 
        expect(test_result.test).to.be.equal('test');
        await consumer.stopConsume();
     });

     

    it('Test Rabbit Consumer consume', async function () {
        var test_result;
        var onMessage = async (data, done) => {
            try {
                test_result = data;
                done();
            } catch (err) {
                console.info("ERRR", err);
            }
        }
        var consumer = await new RabbitConsumer(connector, "url_archive", onMessage);
        await consumer.consume();
        await sleep(2000); 
        expect(test_result.test).to.be.equal('test');
        await consumer.stopConsume();
     });
    it('Test Rabbit Consumer status', async function () {
        var onMessage = async (data, done) => {
            try {
                done();
            } catch (err) {
                console.info("ERRR", err);
            }
        }
        var consumer =  await new RabbitConsumer(connector, "url_archive", onMessage);
        var output =  await consumer.status();
        expect(output).to.be.equal(false);
        await consumer.stopConsume();
 
    });
    it('Test Rabbit restartConsume', async function () {
        var onMessage = async (data, done) => {
            try {
                done();
            } catch (err) {
                console.info("ERRR", err);
            }
        }
        var consumer =  await new RabbitConsumer(connector, "url_archive", onMessage);
        var output = await consumer.restartConsume();
        expect(output).to.be.equal(false);
        await consumer.stopConsume();
    });
    it('Test Rabbit stopConsume', async function () {
        var onMessage = async (data, done) => {
            try {
                done();
            } catch (err) {
                console.info("ERRR", err);
            }
        }
        var consumer =  await new RabbitConsumer(connector, "url_archive", onMessage);
        var output = await consumer.stopConsume();
        expect(consumer.status()).to.be.equal(true);
       
    });
});