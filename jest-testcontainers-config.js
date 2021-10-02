module.exports = {
    rabbitmq: {
        image: 'rabbitmq',
        tag: '3.9-alpine',
        ports: [
            5672
        ],
        wait: {
            type: 'text',
            text: 'Server startup complete'
        }
    },
};
