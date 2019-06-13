const { Command } = require('discord-akairo');
const poll = require('../core/poll.js');
const emojiUtil = require('../util/emoji.js');

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
			const pollMessage = await emojiUtil.search(message.client.hubServer.emojiVoting, input);
			await poll.deny(pollMessage);
			return message.channel.send('Done!');
		} catch (error) {
			return message.reply(error.message);
		}
	}
};
