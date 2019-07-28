const path = require('path');
const { AkairoClient, CommandHandler } = require('discord-akairo');
const HubServer = require('./hubServer.js');
const database = require('../database/index.js');
const { ownerID, prefix } = require('../config.js');
const EmojiVotingPoll = require('./poll/EmojiVotingPoll.js');
const RenameVotingPoll = require('./poll/RenameVotingPoll.js');

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

		this.once('ready', () => {
			this.hubServer = new HubServer(this);
			// NOTE: This stays here because the 2 classes depend on the `hubServer[votingChannel]` props
			this.hubServer.polls = { emoji: new EmojiVotingPoll(this), rename: new RenameVotingPoll(this) };
		});
	}

	async login(token) {
		await database.init();
		return super.login(token);
	}
};
