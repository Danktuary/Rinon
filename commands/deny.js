const { Command } = require('discord-akairo');

module.exports = class DenyCommand extends Command {
	constructor() {
		super('deny', {
			aliases: ['deny', 'deny-emoji', 'deny-rename', 'cancel', 'cancel-emoji', 'cancel-rename'],
			description: 'Deny/cancel a pending emoji or rename poll.',
			channelRestriction: 'guild',
			args: [
				{ id: 'input' },
				{
					id: 'mode',
					match: 'prefix',
					prefix: ['--mode=', '-m='],
					'default': 'emoji',
				},
			],
		});
	}

	async exec(message, { input, mode }) {
		const { alias } = message.util;

		if (['deny-emoji', 'cancel-emoji'].includes(alias)) mode = 'emoji';
		else if (['deny-rename', 'cancel-rename'].includes(alias)) mode = 'rename';
		else if (!['emoji', 'rename'].includes(mode)) mode = 'emoji';

		const { hubServer, ownerID } = this.client;
		const poll = hubServer.polls[mode];

		const pollMessage = await poll.search(input);
		const [, pollAuthorID] = pollMessage.embeds[0].author.name.match(/\((\d+)\)/);

		if (![pollAuthorID, ownerID].includes(message.author.id)) {
			return message.util.reply('you can\'t cancel polls you didn\'t create.');
		}

		await poll.deny({
			message: pollMessage,
			reason: `Cancelled by ${message.author.id === pollAuthorID ? 'poll author' : 'bot owner'}.`,
		});

		return message.channel.send('Done!');
	}
};
