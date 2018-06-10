const { prefix } = require('../config');

const help = {
	name: 'help',
	description: 'List all of my commands or info about a specific command.',
	aliases: ['commands'],
	usage: '[command name]',
	async execute(message, args) {
		const data = [];
		const { commands } = message.client;

		if (!args.length) {
			data.push('Here\'s a list of all my commands:');
			data.push(commands.map(command => command.name).join(', '));
			data.push(`\nYou can send \`${prefix}help [command name]\` to get info on a specific command!`);
		}
		else {
			const command = commands.get(args[0]) ||
				commands.find(c => c.aliases && c.aliases.includes(args[0]));

			if (!command) {
				return message.reply('that\'s not a valid command!');
			}

			data.push(`**Name:** ${command.name}`);

			if (command.aliases.length) data.push(`**Aliases:** ${command.aliases.join(', ')}`);
			if (command.description) data.push(`**Description:** ${command.description}`);
			if (command.usage) data.push(`**Usage:** \`${prefix}${command.name} ${command.usage}\``);
		}

		return message.channel.send(data, { split: true });
	},
};

module.exports = help;
