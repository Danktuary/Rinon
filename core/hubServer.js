const { hubServerID } = require('../config.js')
const regexes = require('../util/regexes.js')
const EmojiVotingPoll = require('./poll/EmojiVotingPoll.js')
const RenameVotingPoll = require('./poll/RenameVotingPoll.js')

module.exports = class HubServer {
	constructor(client) {
		this.client = client
		this.guild = client.guilds.cache.get(hubServerID)
		this.polls = {
			emoji: new EmojiVotingPoll(client),
			rename: new RenameVotingPoll(client),
		}
	}

	_getChannel(name) {
		return this.guild.channels.cache.find(channel => channel.name.toLowerCase() === name.toLowerCase())
	}

	get galleryChannels() {
		return this._getChannel('galleries').children
	}

	galleryChannel(number) {
		return this.galleryChannels.find(channel => {
			return parseInt(channel.name.match(regexes.galleryChannelNameEnding)[1]) === parseInt(number)
		})
	}

	get serverList() {
		return this._getChannel('server-list')
	}

	get votingChannel() {
		return this._getChannel('voting')
	}

	get logsChannel() {
		return this._getChannel('logs')
	}
}
