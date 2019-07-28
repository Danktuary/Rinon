const { Command } = require('discord-akairo');

module.exports = class HelpCommand extends Command {
	constructor() {
		super('help', {
			aliases: ['help'],
			args: [
				{
					id: 'helpCommand',
					match: 'word',
				},
			],
		});
	}

	async exec(message, { helpCommand }) {
		const data = [];
		const commands = this.handler.modules;
		const prefix = this.handler.prefix();

		if (!helpCommand) {
			data.push('Here\'s a list of all my commands:');
			data.push(commands.map(command => command.id).join(', '));
			data.push(`\nYou can send \`${prefix}help [command name]\` to get info on a specific command!`);
		} else {
			const command = commands.find(c => c.aliases.includes(helpCommand.toLowerCase()));

			if (!command) {
				return message.reply(`that's not a valid command! Send \`${prefix}help\` to get a list of all commands.`);
			}

			const { aliases, description, id, options: { usage } } = command;

			data.push(`**Name:** ${id}`);
			if (aliases.length > 1) data.push(`**Aliases:** ${aliases.slice(1).join(', ')}`);
			if (description) data.push(`**Description:** ${description}`);
			if (usage) data.push(`**Usage:** \`${prefix}${id} ${usage}\``);
		}

		return message.channel.send(data, { split: true });
	}
};
