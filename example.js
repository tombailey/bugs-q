const { RabbitMQChannel } = require('bugs-q');

const channel = new RabbitMQChannel(
    'amqp://localhost'
);

const queue = await channel.queue('example');
// or let rabbitmq choose the queue name
// const queue = await channel.queue();
// console.log(queue.name);

await queue.create();

const consumerChannel = new RabbitMQChannel(
    'amqp://localhost'
);
const consumerQueue = await consumerChannel.queue('example');
await consumerQueue.consume(async (message) => {
    console.log('got a new message', message.content.toString());
    await consumerQueue.acknowledge(message);
    // or nack
    // await consumerQueue.nacknowledge(message);
});

await queue.publish('hello world');
