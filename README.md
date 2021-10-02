# bugs-q

A RabbitMQ JavaScript client library. Because [amqplib](https://www.npmjs.com/package/amqplib) didn't look particularly appealing out of the box.

## Installation

```sh
npm install --save bugs-q
```

## Usage

Publishing
```js
const { RabbitMQChannel } = require('bugs-q');

const publishingChannel = new RabbitMQChannel('amqp://localhost');
const queue = await publishingChannel.queue('example');
await queue.publish('hello world');
```

Consuming
```js
const { RabbitMQChannel } = require('bugs-q');

const consumingChannel = new RabbitMQChannel('amqp://localhost');
const queue = await consumingChannel.queue('example');
await queue.consume(async (message) => {
    console.log('got a new message', message.content.toString());
    await queue.acknowledge(message);
});
```

Note: don't publish and consume using the same instance of a channel.

See [examples](./example.js) for more usage scenarios.

## License

[Apache License Version 2.0](./LICENSE)
