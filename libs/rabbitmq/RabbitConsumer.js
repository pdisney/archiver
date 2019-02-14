var sleep = (time) => {
    return new Promise(resolve => {
        setTimeout(() => {
            return resolve();
        }, time);
    });
}




class RabbitConsumer {

    constructor(connector, queue, onMessage) {
        return (async () => {
            console.info("PARAMETERS",queue);
            if(!connector||!queue||!onMessage){
                console.error("Unable to create RabbitConsumer. Missing Parameter");
                console.error("Connector", connector);
                console.error('Queue', queue);
                console.error("Message Function", onMessage);
                var err = {};
                err.message = "Rabbit Consumer is missing constructor parameters.";
                throw err;
            }


            this.connector = connector;
            this.channel;
            this.q = queue;
            this.stop = false;
            this.onMessage = onMessage;
            this.consumerTag;
            await this.consume();

            return this;

        })();
    }

    consume() {
        return (async () => {
            try {
                this.stop = false;

                this.channel = await this.connector.getChannel();
                await this.channel.assertQueue(this.q, { durable: true, noAck: false });

                var serverResponse = await this.channel.consume(this.q, async (rabbit_message) => {
                    try {
                        var message_payload = "";
                        //  try {
                        if (rabbit_message.content) {
                            message_payload = rabbit_message.content.toString();
                        }

                        var data = JSON.parse(message_payload);
                        if(data.image){
                            data.image =  new Buffer(data.image);
                        }
                        if(data.file){
                            data.file = new Buffer(data.file);
                        }

                        var done = async () => {
                            try {
                                await this.channel.ack(rabbit_message);
                            } catch (err) {
                                console.error("Message Acknowlegment Error", err);
                                await this.restartConsume();
                            }

                        };
                        await this.onMessage(data, done);
                        return;
                    } catch (err) {
                        console.error("CONSUME ERROR - Could not Consume Queue:", this.q, err);
                        await this.channel.ack(rabbit_message);
                    }
                }, [{ noAck: false }, [
                    (err, ok) => {
                        console.error("Consume ERROR", err);
                    }
                ]]);
                console.info("Consumption of", this.q, "has started.");
                this.consumerTag = serverResponse.consumerTag;
            } catch (err) {
                console.error(err);
            }
        })();
    }

    restartConsume() {
        return (async () => {
            try {
                this.stop = false;
                if (this.consumerTag && this.channel !== null)
                    await this.channel.cancel(this.consumerTag);
                if (this.channel !== null)
                    await this.connector.closeChannel(this.channel);
                await sleep(10000);
                this.channel = null;
                await this.consume();
                console.info("Consuming", this.q, "has restarted.");
                return this.stop;
            } catch (err) {
                console.error(err);
                throw err;
            }
        })();
    }

    stopConsume() {
        return (async () => {
            try {
                this.stop = true;
                if (this.consumerTag && this.consumerTag !== null) {
                    await this.channel.cancel(this.consumerTag);
                    this.consumerTag = null;
                }
                await this.connector.closeChannel(this.channel);
                this.channel = null;
                console.info("Consumption of", this.q, "has ceased.");
            } catch (err) {
                console.error(err);
                throw err;
            }
        })();
    }

    status() {
        return this.stop;
    }
}
module.exports = RabbitConsumer;
