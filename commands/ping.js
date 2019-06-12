const { Command } = require('discord-akairo');

module.exports = class PingCommand extends Command {
	constructor() {
		super('ping', {
			aliases: ['ping'],
		});
	}

	async exec(message) {
		const sent = await message.channel.send('Pinging...');
		return sent.edit(`Pong! Took ${sent.createdTimestamp - message.createdTimestamp}ms`);
	}
};
