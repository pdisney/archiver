const MAXMESSAGESIZE = 150;//MB


class RabbitPublish {
    constructor(connector) {
        this.connector = connector;
    }

    publish(q, message) {
        return (async () => {
            try {
                var status;
                var channel = await this.connector.getChannel();
                await channel.assertQueue(q, { durable: true, noAck: false });

                var size = Buffer.byteLength(JSON.stringify(message));
                if (size !== 0) {
                    size = size / 1000 / 1000;
                }
                if (size <= MAXMESSAGESIZE) {
                    status = await channel.sendToQueue(q, new Buffer(JSON.stringify(message)), { persistent: true });
                    console.debug("Message Sent", q, status, message);
                } else {
                    var output = "Message Exceeded Maximum Message size. Message Size:" + size + "MB MAX Message Size:" + MAXMESSAGESIZE + "MB";
                    console.info(output);
                    status = output;
                }
                await this.connector.closeChannel(channel);
                return status;
            } catch (err) {
                console.error(q, err);
                throw err;
            }
        })();
    }
}


module.exports = RabbitPublish;