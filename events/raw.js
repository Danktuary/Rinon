const raw = async (client, event) => {
	if (event.t !== 'MESSAGE_REACTION_ADD') return;

	const { d: data } = event;
	const channel = client.channels.get(data.channel_id);

	if (!data.emoji.id || channel.messages.has(data.message_id)) return;

	const user = client.users.get(data.user_id);
	const message = await channel.messages.fetch(data.message_id);
	const reaction = message.reactions.get(data.emoji.id);

	client.emit('messageReactionAdd', reaction, user);
};

module.exports = raw;
