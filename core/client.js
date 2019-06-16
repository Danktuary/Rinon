const path = require('path');
const { AkairoClient, CommandHandler } = require('discord-akairo');
const HubServer = require('./hubServer.js');
const database = require('../database/index.js');
const { ownerID, prefix } = require('../config.js');

module.exports = class RinonClient extends AkairoClient {
	constructor() {
		super({ ownerID });

		this.commandHandler = new CommandHandler(this, {
			commandDirectory: path.join(__dirname, '..', 'commands'),
			prefix,
		});

		this.once('ready', () => {
			this.hubServer = new HubServer(this);
			this.emojiGuilds = this.guilds.filter(guild => /\(ES#\d+\)$/.test(guild.name));
		});
	}

	async login(token) {
		await database.init();
		return super.login(token);
	}
};
