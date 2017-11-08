const ping = {
	name: 'ping',
	description: 'Pong!',
	async execute(message) {
		const sent = await message.channel.send('Pinging...');
		return sent.edit(`Pong! Took ${sent.createdTimestamp - message.createdTimestamp}ms`);
	},
};

module.exports = ping;
