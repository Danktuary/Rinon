const { Command } = require('discord-akairo');

module.exports = class DenyCommand extends Command {
	constructor() {
		super('deny', {
			aliases: ['deny'],
			args: [
				{
					id: 'input',
					type: 'string',
				},
			],
		});
	}

	async exec(message, { input }) {
		try {
			// TODO: use flags/"prefixes" to determine if it should be 'emoji' or 'rename'
			const poll = this.client.hubServer.polls.emoji;
			await poll.deny(await poll.search(input));
			return message.channel.send('Done!');
		} catch (error) {
			console.error(error);
			return message.reply(error.message);
		}
	}
};
