const { Command } = require('discord-akairo');

module.exports = class ApproveCommand extends Command {
	constructor() {
		super('approve', {
			aliases: ['approve'],
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
		if (!['emoji', 'rename'].includes(mode)) mode = 'emoji';
		const poll = this.client.hubServer.polls[mode];
		await poll.approve(await poll.search(input));
		return message.channel.send('Done!');
	}
};
