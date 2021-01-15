const { Listener } = require('discord-akairo');
const { emojis, voteEndAmount } = require('../config.js');

module.exports = class MessageReactionAddListener extends Listener {
	constructor() {
		super('messageReactionAdd', {
			emitter: 'client',
			event: 'messageReactionAdd',
		});
	}

	async exec(reaction, user) {
		if (user.bot) return;

		const { message } = reaction;

		if (message.channel.id !== this.client.hubServer.votingChannel.id) return;
		if (![emojis.approve, emojis.deny].includes(reaction.emoji.id)) return;

		const poll = this._getPoll(message);
		const pollData = await poll.model.findOne({ where: { messageID: message.id } });
		const endAmount = reaction.users.has(pollData.authorID) ? voteEndAmount + 2 : voteEndAmount + 1;

		if (reaction.count < endAmount) return;
		if (reaction.emoji.id === emojis.deny) return poll.deny({ message });
		return poll.approve({ message });
	}

	_getPoll(message) {
		const { embeds: [embed] } = message;
		if (embed.description.includes('wants to add')) return this.client.hubServer.polls.emoji;
		if (embed.description.includes('wants to rename')) return this.client.hubServer.polls.rename;
		return null;
	}
};
