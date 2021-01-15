const { Command } = require('discord-akairo');

module.exports = class DenyCommand extends Command {
	constructor() {
		super('deny', {
			aliases: ['deny', 'deny-emoji', 'deny-rename', 'cancel', 'cancel-emoji', 'cancel-rename'],
			description: 'Deny/cancel a pending emoji or rename poll.',
			channel: 'guild',
			args: [
				{ id: 'input' },
				{
					id: 'mode',
					match: 'option',
					flag: ['--mode=', '-m='],
					'default': 'emoji',
				},
			],
			options: {
				help: {
					examples: [
						'EmojiName (if `--mode=x` argument is omitted, defaults to `emoji`)',
						'EmojiName --mode=emoji (approves a pending emoji poll)',
						'EmojiName --mode=rename (approves a pending rename poll)',
					],
				},
			},
		});
	}

	async exec(message, { input, mode }) {
		if (['deny-emoji', 'cancel-emoji'].includes(message.util.parsed.alias)) mode = 'emoji';
		else if (['deny-rename', 'cancel-rename'].includes(message.util.parsed.alias)) mode = 'rename';
		else if (!['emoji', 'rename'].includes(mode)) mode = 'emoji';

		const { hubServer, ownerID } = this.client;
		const poll = hubServer.polls[mode];
		const { pollData, message: pollMessage } = await poll.search(input);

		if (![pollData.authorID, ownerID].includes(message.author.id)) {
			return message.util.reply('you can\'t cancel polls you didn\'t create.');
		}

		await poll.deny({
			message: pollMessage,
			reason: `Cancelled by ${message.author.id === pollData.authorID ? 'poll author' : 'bot owner'}.`,
		});

		return message.channel.send('Done!');
	}
};
