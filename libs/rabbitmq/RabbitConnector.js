const mq = require('amqplib');

var sleep = (time) => {
    return new Promise(resolve => {
        setTimeout(() => {
            return resolve();
        }, time);
    });
}

process.on('unhandledRejection', error => {
    // Will print "unhandledRejection err is not defined"
    console.debug('[unhandledRejection] Channel is Operational', error.isOperational);
     if (!error.isOperational) {
        console.error(error);
    }
});


class RabbitConnector {
    constructor(address) {
        return (async () => {
            try {
                this.address = address;
                if (this.connection === null || this.connection === undefined) {
                    this.connection = await mq.connect(this.address);
                }
                return this;
            } catch (err) {
                this.connection = null;
                console.error(err);
                console.info("Retrying Connection");
                await this.retryConnection();
            }
        })();

    }

    retryConnection() {
        return (async () => {
            try {
                await this.closeConnection;
                this.connection = null;
                console.info("Retrying Rabbit Connection to:", this.address);
                await sleep(10000);
                if (this.connection === null || this.connection === undefined) {
                    this.connection = await mq.connect(this.address);
                    console.info("Connector", this.connection);
                    console.info("Rabbit Connection to ", this.address, " completed successfully.");
                }
            } catch (err) {
                console.error(err);
                await this.retryConnection();
            }

        })();
    }

    closeConnection() {
        return (async () => {
            try {
                if (this.connection) {
                    await this.connection.close();
                    this.connection = null;
                    console.info("Connection Successfully closed to ",this.address);
                }
                return;
            } catch (err) {
                console.error('[Connection ERROR]', err);
                this.connection = null;
                return;
            }
        })();
    }

    getChannel() {
        return (async () => {
            try {
                var channel = await this.connection.createConfirmChannel();
                channel.prefetch(1);
                return channel;
            } catch (err) {
                console.error("ERROR", err);
             //   await this.retryChannel();
            }
        })();
    }


    closeChannel(channel) {
        return (async () => {
          try{
                await channel.close();
                return 1;
            }
            catch (alreadyClosed) {
               // console.error(alreadyClosed.stackAtStateChange);
                return -1;
            }
        })();
    }

    checkQueue(q){
        return (async()=>{
            var output = { 'queue': q, 'messageCount': 0, "consumerCount": 0 };
            try {
                var ch = await this.getChannel();
                var output = await ch.checkQueue(q);
                await this.closeChannel(ch);
            } catch (err) {
                console.error(err);
        
            } finally {
                return output;
            }
        })()
    }
    purgeQueue(q){
        return (async()=>{
            var messageCount = 0;
            try {
                var ch = await this.getChannel();
                messageCount = await ch.purgeQueue(q);
                await this.closeChannel(ch);
            } catch (err) {
                console.error(err);
            } finally {
                return messageCount;
            }
        })()
    }
    deleteQueue(q){
        return (async()=>{
            try {
                var ch = await this.getChannel();
                await ch.deleteQueue(q);
                await this.closeChannel(ch);
            } catch (err) {
                console.error(err);
            } finally {
                return { "success": q + " deleted" };
            }
        })()
    }
    createQueue(q){
        return (async()=>{
           
            try {
                var ch = await this.getChannel();
                var output =  await ch.assertQueue(q, { durable: true, noAck: false });
                await this.closeChannel(ch);
                return output;
            } catch (err) {
                console.error(err);
            } 
        })()
    }
}


module.exports = RabbitConnector;
