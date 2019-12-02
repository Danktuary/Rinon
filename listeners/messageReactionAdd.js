const { Listener } = require('discord-akairo');
const { emojis, voteEndAmount } = require('../config.js');

module.exports = class MessageReactionAddListener extends Listener {
	constructor() {
		super('messageReactionAdd', { eventName: 'messageReactionAdd' });
	}

	async exec(reaction, user) {
		const { message } = reaction;
		const { client, embeds: [embed] } = message;
		const poll = Object.values(client.hubServer.polls).find(p => p.channel.id === message.channel.id);

		if (user.bot || !poll) return;
		if (![emojis.approve, emojis.deny].includes(reaction.emoji.id)) return;
		if (!embed || embed.color) return;

		const pollData = await poll.model.findOne({ where: { messageID: message.id } });
		const endAmount = reaction.users.has(pollData.authorID) ? voteEndAmount + 2 : voteEndAmount + 1;

		if (reaction.count < endAmount) return;
		if (reaction.emoji.id === emojis.deny) return poll.deny(message);
		return poll.approve({ message });
	}
};
