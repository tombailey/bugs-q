const amqplib = require('amqplib');

const RabbitMQQueueClient = require('../queue');

class RabbitMQChannel {
    constructor(uri, connectionOptions) {
        this.uri = uri;
        this.connectionOptions = connectionOptions;

        this.channel = null;
    }

    async _connect(relinquishExisting=false) {
        const connection = await amqplib.connect(this.uri, this.connectionOptions);
        if (this.channel === null || relinquishExisting) {
            this.channel = await connection.createConfirmChannel();
            //TODO: reject pending promises on error
            this.channel.on('close', () => {
                console.warn('RabbitMQChannel closed');
                this._reconnect();
            });
            this.channel.on('error', (error) => {
                console.warn('RabbitMQChannel broke', error);
                this._reconnect();
            });
        }
    }

    async _reconnect() {
        await this._connect(true);
    }

    async _ensureConnection() {
        if (this.channel === null) {
            await this._connect();
        }
    }

    async _getChannel() {
        await this._ensureConnection();
        return this.channel;
    }

    async queue(name=null) {
        await this._ensureConnection();
        return new RabbitMQQueueClient(this, name);
    }
}

module.exports = RabbitMQChannel;
