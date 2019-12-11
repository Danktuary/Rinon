const path = require('path');
const { AkairoClient, CommandHandler } = require('discord-akairo');
const Sync = require('./sync.js');
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
			handleEdits: true,
			commandUtil: true,
			commandUtilLifetime: 600000,
			commandDirectory: path.join(__dirname, '..', 'commands'),
			defaultPrompt: {
				timeout: 'time ran out, command has been cancelled.',
				ended: 'too many retries, command has been cancelled.',
				cancel: 'command has been cancelled.',
				retries: 4,
				time: 30000,
			},
		});

		this.once('ready', () => {
			this.sync = new Sync(this);
			this.hubServer = new HubServer(this);
			// NOTE: This stays here because the 2 classes depend on the `hubServer[votingChannel]` props
			this.hubServer.polls = { emoji: new EmojiVotingPoll(this), rename: new RenameVotingPoll(this) };
			this.sync.status();
		});
	}

	async login(token) {
		await database.init();
		return super.login(token);
	}
};
