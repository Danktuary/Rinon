const { hubServerID } = require('../config.js');

module.exports = class HubServer {
	constructor(client) {
		this.client = client;
		this.guild = client.guilds.get(hubServerID);
	}

	_getChannel(name) {
		return this.guild.channels.find(channel => channel.name.toLowerCase() === name.toLowerCase());
	}

	get galleryChannels() {
		return this._getChannel('galleries').children;
	}

	galleryChannel(number) {
		return this._getChannel('galleries').children.find(channel => parseInt(channel.name.slice(-1)) === parseInt(number));
	}

	get serverList() {
		return this._getChannel('server-list');
	}

	get votingChannel() {
		return this._getChannel('voting');
	}

	get logsChannel() {
		return this._getChannel('logs');
	}
};
