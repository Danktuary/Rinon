const { Command } = require('discord-akairo')

module.exports = class PingCommand extends Command {
	constructor() {
		super('ping', {
			aliases: ['ping'],
			description: 'Pong!',
		})
	}

	async exec(message) {
		const sent = await message.util.send('Pinging...')
		return sent.edit(`Pong! Took ${sent.createdTimestamp - message.createdTimestamp}ms`)
	}
}
