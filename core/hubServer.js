const { hubServerID } = require('../config.js');

module.exports = class HubServer {
	constructor(client) {
		this.client = client;
		this.id = hubServerID;
		this.guild = client.guilds.get(hubServerID);
	}

	_getChannel(name) {
		return this.guild.channels.find(channel => channel.name.toLowerCase() === name);
	}

	get serverList() {
		return this._getChannel('server-list');
	}

	get emojiVoting() {
		return this._getChannel('emoji-voting');
	}
};