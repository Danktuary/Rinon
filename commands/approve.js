const { Command } = require('discord-akairo');
const poll = require('../core/poll.js');
const emojiUtil = require('../util/emoji.js');

module.exports = class ApproveCommand extends Command {
	constructor() {
		super('approve', {
			aliases: ['approve'],
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
			await poll.approve(pollMessage);
			return message.channel.send('Done!');
		} catch (error) {
			return message.reply(error.message);
		}
	}
};
