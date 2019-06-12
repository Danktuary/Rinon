const path = require('path');
const { prefix } = require('../config.js');
const { AkairoClient, CommandHandler } = require('discord-akairo');
const database = require('../database/index.js');

module.exports = class RinonClient extends AkairoClient {
	constructor() {
		super({
			ownerID: '126485019500871680',
		});

		this.commandHandler = new CommandHandler(this, {
			commandDirectory: path.join(__dirname, '..', 'commands'),
			prefix,
		});
	}

	async login(token) {
		await database.init();
		return super.login(token);
	}
};
