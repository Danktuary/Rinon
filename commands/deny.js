const { Command } = require('discord-akairo');

module.exports = class DenyCommand extends Command {
	constructor() {
		super('deny', {
			aliases: ['deny', 'cancel'],
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

		const { hubServer, ownerID } = this.client;
		const poll = hubServer.polls[mode];

		if (message.util.alias === 'deny' && message.author.id !== ownerID) {
			const owner = await this.client.fetchUser(ownerID);
			return message.util.reply(`only ${owner.tag} may use that command. If you're trying to cancel your own poll, use \`${this.handler.prefix()}cancel <input>\``);
		}

		const pollMessage = await poll.search(input);
		const [, pollAuthorID] = pollMessage.embeds[0].author.name.match(/\((\d+)\)/);

		if (![pollAuthorID, ownerID].includes(message.author.id)) {
			return message.util.reply('you can\'t cancel polls you didn\'t create.');
		}

		await poll.deny(pollMessage, `Cancelled by ${message.author.id === pollAuthorID ? 'poll author' : 'bot owner'}.`);
		return message.util.send('Done!');
	}
};
