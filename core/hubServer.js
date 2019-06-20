const { hubServerID } = require('../config.js');
const EmojiVotingPoll = require('./poll/EmojiVotingPoll.js');
const RenameVotingPoll = require('./poll/RenameVotingPoll.js');

module.exports = class HubServer {
	constructor(client) {
		this.client = client;
		this.id = hubServerID;
		this.guild = client.guilds.get(hubServerID);
		this.polls = { emoji: new EmojiVotingPoll(client), rename: new RenameVotingPoll(client) };
	}

	_getChannel(name) {
		return this.guild.channels.find(channel => channel.name.toLowerCase() === name.toLowerCase());
	}

	get serverList() {
		return this._getChannel('server-list');
	}

	get emojiVoting() {
		return this._getChannel('voting');
	}

	get renameVoting() {
		return this._getChannel('rename-voting');
	}

	get approvedEmojis() {
		return this._getChannel('approved-emojis');
	}

	get deniedEmojis() {
		return this._getChannel('denied-emojis');
	}
};
