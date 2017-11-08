const { Client } = require('discord.js');
const { disabledEvents, token } = require('./config');

const client = new Client({ disabledEvents });

const Bootstrap = require('./bootstrap');

client.commands = Bootstrap.commands();
Bootstrap.events(client);

client.login(token);

process.on('unhandledRejection', error => {
	console.error(`Uncaught Promise Rejection: \n${error.stack}`);
});
