const AmiClient = require('asterisk-ami-client');
const client = new AmiClient({ reconnect: false, keepAlive: false });
client.on('connect', async () => {
    console.log("Connected");
    const res = await client.action({ Action: 'Command', Command: 'core show uptime' });
    console.log("Keys:", Object.keys(res));
    console.log("Is output array:", Array.isArray(res.output));
    console.log(res);
    client.disconnect();
});
client.connect('nodejs-ami', 'Pass1234', { host: '127.0.0.1', port: 5038 });
