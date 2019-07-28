const { Command } = require('discord-akairo');

module.exports = class ReloadCommand extends Command {
	constructor() {
		super('reload', {
			aliases: ['reload'],
			ownerOnly: true,
			args: [
				{
					id: 'alias',
					match: 'word',
				},
			],
		});
	}

	async exec(message, { alias }) {
		const command = this.client.commandHandler.modules.find(c => c.aliases.includes(alias.toLowerCase()));
		if (!command) return message.util.send('That\'s not a valid command.');

		command.reload();
		return message.util.send(`\`${command.aliases[0]}\` command reloaded.`);
	}
};
