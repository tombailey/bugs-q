const RabbitMQChannel = require('../src').RabbitMQChannel;

describe('RabbitMQQueue tests', () => {
    let channel;
    let queue;

    beforeEach(async () => {
        channel = createNewChannel();
        queue = await channel.queue();
        await queue.create();
    });

    afterEach(async () => {
        await channel.close().catch(console.warn);
    });

    function createNewChannel() {
        return new RabbitMQChannel(
            `amqp://${global.__TESTCONTAINERS_RABBITMQ_IP__}:${global.__TESTCONTAINERS_RABBITMQ_PORT_5672__}`
        );
    }

    it('should create queues', async () => {
        const exists = await queue.exists();
        expect(exists).toBe(true);
    });

    it('should publish messages', async () => {
        const message = 'message';
        await queue.publish(message);

        const { messageCount } = await queue.stats();
        expect(messageCount).toBe(1);
    });

    it('should consume messages', (done) => {
        const channel = createNewChannel();
        channel.queue(queue.name).then(async (consumerQueue) => {
            const expectedMessage = 'message';
            await consumerQueue.consume((message) => {
                expect(message.content.toString()).toEqual(expectedMessage);
                done();
            });

            await queue.publish(expectedMessage);
        });

        expect.hasAssertions();
    });

    it('should acknowledge messages', (done) => {
        const channel = createNewChannel();
        channel.queue(queue.name).then(async (consumerQueue) => {
            const expectedMessage = 'message';
            const consumer = await consumerQueue.consume(async (message) => {
                await consumerQueue.acknowledge(message);

                const { messageCount } = await consumerQueue.stats();
                expect(messageCount).toBe(0);

                await consumerQueue.cancel(consumer);
                done();
            });

            await queue.publish(expectedMessage);
        });

        expect.hasAssertions();
    });

    it('should nacknowledge messages', (done) => {
        const channel = createNewChannel();
        channel.queue(queue.name).then(async (consumerQueue) => {
            const expectedMessage = 'message';
            let messageCount = 0;
            const consumer = await consumerQueue.consume(async (message) => {
                expect(message.content.toString()).toEqual(expectedMessage);

                messageCount += 1;
                if (messageCount > 1) {
                    await consumerQueue.cancel(consumer);
                    done();
                } else {
                    await consumerQueue.nacknowledge(message);
                }
            });

            await queue.publish(expectedMessage);
        });

        expect.assertions(2);
    });

    it('should purge messages', async () => {
        await queue.publish('message');

        await queue.purge();

        const { messageCount } = await queue.stats();
        expect(messageCount).toBe(0);
    });

    it('should delete queues', async () => {
        await queue.delete();

        const exists = await queue.exists();
        expect(exists).toBe(false);
    });
});
