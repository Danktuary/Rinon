const { Command } = require('discord-akairo');

module.exports = class ApproveCommand extends Command {
	constructor() {
		super('approve', {
			aliases: ['approve', 'approve-emoji', 'approve-rename'],
			description: 'Approve a pending emoji or rename poll.',
			channelRestriction: 'guild',
			ownerOnly: true,
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
		if (message.util.alias === 'approve-emoji') mode = 'emoji';
		else if (message.util.alias === 'approve-rename') mode = 'rename';
		else if (!['emoji', 'rename'].includes(mode)) mode = 'emoji';

		const poll = this.client.hubServer.polls[mode];
		const { message: pollMessage } = await poll.search(input);

		await poll.approve({ message: pollMessage });
		return message.channel.send('Done!');
	}
};
