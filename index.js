const { token } = require('./config.js');
const RinonClient = require('./core/client.js');

const client = new RinonClient();

client.on('ready', () => console.log(`${client.user.tag} ready!`));

client.login(token);
