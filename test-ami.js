const net = require('net');

const client = new net.Socket();
client.connect(3461, '127.0.0.1', () => {
    console.log('Connected');
    client.write('Action: Login\r\nUsername: nodejs-ami\r\nSecret: Pass1234\r\n\r\n');
});

client.on('data', (data) => {
    const output = data.toString();
    console.log('--- DATA RECEIVED ---');
    console.log(output);
    if (output.includes('Authentication accepted')) {
        client.write('Action: Command\r\nCommand: pjsip show endpoints\r\n\r\n');
    }
});

client.on('error', err => console.error(err));
