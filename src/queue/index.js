class RabbitMQQueueClient {
    constructor(channelWrapper, name=null) {
        this.channelWrapper = channelWrapper;
        this.name = name;
    }

    async exists() {
        try {
            await this.stats();
            return true;
        } catch (error) {
            if (error.code === 404) {
                return false;
            } else {
                throw error;
            }
        }
    }

    async stats() {
        const channel = await this.channelWrapper._getChannel();
        const stats = await channel.checkQueue(this.name);
        return {
            consumerCount: stats.consumerCount,
            messageCount: stats.messageCount
        };
    }

    async create(options) {
        const channel = await this.channelWrapper._getChannel();
        const stats = await channel.assertQueue(this.name, options);
        if (this.name === null) {
            this.name = stats.queue;
        }
    }

    async publish(message, options) {
        const channel = await this.channelWrapper._getChannel();
        await channel.sendToQueue(
            this.name,
            Buffer.from(message),
            options
        );
        await channel.waitForConfirms();
    }

    async consume(callback, options) {
        const channel = await this.channelWrapper._getChannel();
        const consumer = await channel.consume(this.name, callback, options);
        return consumer.consumerTag;
    }

    async delete(options) {
        const channel = await this.channelWrapper._getChannel();
        await channel.deleteQueue(this.name, options);
    }

    async purge() {
        const channel = await this.channelWrapper._getChannel();
        await channel.purgeQueue(this.name);
    }

    async acknowledge(message) {
        const channel = await this.channelWrapper._getChannel();
        await channel.ack(message);
    }

    async nacknowledge(message) {
        const channel = await this.channelWrapper._getChannel();
        await channel.nack(message);
    }

    async cancel(consumerTag) {
        const channel = await this.channelWrapper._getChannel();
        channel.cancel(consumerTag);
    }
}

module.exports = RabbitMQQueueClient;
