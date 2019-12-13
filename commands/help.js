const { RichEmbed } = require('discord.js');
const { Command } = require('discord-akairo');
const { colors } = require('../config.js');
const textUtil = require('../util/text.js');
const permissionsUtil = require('../util/permissions.js');

module.exports = class HelpCommand extends Command {
	constructor() {
		super('help', {
			aliases: ['help'],
			description: 'Display a list of all available commands, or display info about a single command.',
			args: [
				{
					id: 'command',
					type: 'commandAlias',
					prompt: {
						start: 'which command would you like more info about?',
						retry: message => {
							return [
								`That\'s not a valid command! Send \`!cancel\` and then \`${message.util.command.handler.prefix()}help\` to get a list of all commands.`,
								'Which command would you like more info about?',
							].join('\n');
						},
						optional: true,
						cancelWord: '!cancel',
					},
				},
			],
			options: {
				help: {
					examples: ['', 'add'],
				},
			},
		});
	}

	async exec(message, { command }) {
		const { modules: commands } = this.handler;
		const prefix = this.handler.prefix();

		if (!command) {
			return message.util.send([
				`Here\'s a list of all my commands: ${commands.map(cmd => cmd.id).join(', ')}\n`,
				`You can send \`${prefix}help [command name]\` to get info on a specific command!`,
			]);
		}

		const { help: helpData = {} } = command.options;

		const embed = new RichEmbed()
			.setColor(colors.pink)
			.setAuthor(`${textUtil.capitalize(command.id)} command`, this.client.user.displayAvatarURL)
			.addField('Aliases', command.aliases.join(', '), true);

		if (command.description) embed.setDescription(command.description);
		if (command.ownerOnly) embed.addField('Owner Only', 'Yes', true);

		if (command.channelRestriction) {
			embed.addField('Restricted to', textUtil.capitalize(command.channelRestriction), true);
		}

		if (command.userPermissions) {
			embed.addField('User permissions needed', permissionsUtil.formatNames(command.userPermissions), true);
		}

		if (helpData.examples && helpData.examples.length) {
			embed.addField('Examples', helpData.examples.map(example => `${prefix}${command.id} ${example}`).join('\n'));
		}

		return message.util.send(embed);
	}
};
