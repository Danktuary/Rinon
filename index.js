const { Client } = require('discord.js');
const client = new Client;

const Bootstrap = require('./bootstrap');
const { token } = require('./config');

client.commands = Bootstrap.commands();
Bootstrap.events(client);

client.login(token);

process.on('unhandledRejection', error => {
	console.error(`Uncaught Promise Rejection: \n${error.stack}`);
});
