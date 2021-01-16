const { Command } = require('discord-akairo')

module.exports = class ApproveCommand extends Command {
	constructor() {
		super('approve', {
			aliases: ['approve', 'approve-emoji', 'approve-rename'],
			description: 'Approve a pending emoji or rename poll.',
			channel: 'guild',
			ownerOnly: true,
			args: [
				{ id: 'input' },
				{
					id: 'mode',
					match: 'option',
					flag: ['--mode=', '-m='],
					'default': 'emoji',
				},
			],
		})
	}

	async exec(message, { input, mode }) {
		if (message.util.parsed.alias === 'approve-emoji') mode = 'emoji'
		else if (message.util.parsed.alias === 'approve-rename') mode = 'rename'
		else if (!['emoji', 'rename'].includes(mode)) mode = 'emoji'

		const poll = this.client.hubServer.polls[mode]
		const { message: pollMessage } = await poll.search(input)

		await poll.approve({ message: pollMessage })
		return message.channel.send('Done!')
	}
}
