const { Command } = require('discord-akairo');

module.exports = class ApproveCommand extends Command {
	constructor() {
		super('approve', {
			aliases: ['approve', 'approve-emoji', 'approve-rename'],
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
		await poll.approve({ message: await poll.search(input) });
		return message.channel.send('Done!');
	}
};
