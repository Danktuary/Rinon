const { Listener } = require('discord-akairo');
const { Emoji, MessageReaction } = require('discord.js');

module.exports = class RawListener extends Listener {
	constructor() {
		super('raw', {
			emitter: 'client',
			event: 'raw',
		});
	}

	async exec({ t: eventName, d: data }) {
		if (eventName !== 'MESSAGE_REACTION_ADD') return;

		const { client } = this;
		const user = client.users.cache.get(data.user_id) || await client.users.fetch(data.user_id);
		const channel = client.channels.cache.get(data.channel_id) || await user.createDM();

		if (channel.messages.cache.has(data.message_id)) return;

		const message = await channel.messages.fetch(data.message_id);
		const emojiKey = (data.emoji.id) ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;
		let reaction = message.reactions.cache.get(emojiKey);

		if (!reaction) {
			const emoji = new Emoji(client.guilds.cache.get(data.guild_id), data.emoji);
			reaction = new MessageReaction(message, emoji, 1, data.user_id === client.user.id);
		}

		this.client.emit('messageReactionAdd', reaction, user);
	}
};
