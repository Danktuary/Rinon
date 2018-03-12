const { Client } = require('discord.js');

require('./db/');

const Bootstrap = require('./bootstrap');
const { disabledEvents, token } = require('./config');

const client = new Client({ disabledEvents });

client.commands = Bootstrap.commands();
Bootstrap.events(client);

client.login(token);

process.on('unhandledRejection', error => {
	console.error(`Uncaught Promise Rejection: \n${error.stack}`);
});
