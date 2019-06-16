const { Listener } = require('discord-akairo');
const poll = require('../core/poll.js');
const models = require('../database/models/');
const { emojis, voteEndAmount } = require('../config');

module.exports = class MessageReactionAddListener extends Listener {
	constructor() {
		super('messageReactionAdd', {
			emitter: 'client',
			eventName: 'messageReactionAdd',
		});
	}

	async exec(reaction, user) {
		if (user.bot || reaction.message.channel.name !== 'emoji-voting') return;
		if (![emojis.approve, emojis.deny].includes(reaction.emoji.id)) return;

		const { message } = reaction;
		const [embed] = message.embeds;

		if (!embed || embed.color) return;

		const pollData = await models.Poll.findOne({ where: { messageID: message.id } });
		const endAmount = (reaction.users.has(pollData.authorID)) ? voteEndAmount + 2 : voteEndAmount + 1;

		if (reaction.count < endAmount) return;
		if (reaction.emoji.id === emojis.deny) return poll.deny(message);
		return poll.approve(message);
	}
};
