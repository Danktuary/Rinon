const path = require('path');
const { AkairoClient, CommandHandler } = require('discord-akairo');
const HubServer = require('./hubServer.js');
const database = require('../database/index.js');
const { ownerID, prefix } = require('../config.js');

module.exports = class RinonClient extends AkairoClient {
	constructor() {
		super({
			ownerID,
			listenerDirectory: path.join(__dirname, '..', 'listeners'),
		});

		this.commandHandler = new CommandHandler(this, {
			prefix,
			commandDirectory: path.join(__dirname, '..', 'commands'),
		});

		this.once('ready', () => this.hubServer = new HubServer(this));
	}

	async login(token) {
		await database.init();
		return super.login(token);
	}
};
