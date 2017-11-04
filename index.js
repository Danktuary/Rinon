const { Client } = require('discord.js');
const { token } = require('./config');
const client = new Client;

const Bootstrap = require('./bootstrap');

client.commands = Bootstrap.commands();
Bootstrap.events(client);

client.login(token);
