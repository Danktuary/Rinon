const { Command } = require('discord-akairo');

module.exports = class ReloadCommand extends Command {
	constructor() {
		super('reload', {
			aliases: ['reload'],
			ownerOnly: true,
			args: [
				{
					id: 'command',
					match: 'word',
				},
			],
		});
	}

	async exec(message, { command }) {
		this.client.commandHandler.reload(command);
		return message.channel.send(`\`${command}\` command reloaded.`);
	}
};
