const { MessageEmbed } = require('discord.js');

const { colors, prefix } = require('../config');

const emojiSearch = {
	name: 'emoji-search',
	description: 'Search for an emoji across all servers by name!',
	aliases: ['emojisearch', 'emoji', 'search'],
	usage: '<name>',
	async execute(message, args) {
		if (!args.length) {
			return message.reply('you need to give me at least a name to search for!');
		}

		const name = args.join(' ').toLowerCase();

		if (!/^\w+$/.test(name)) {
			return message.reply('only alphanumeric characters are allowed!');
		}

		const emojis = message.client.emojis.filter(emoji => {
			return emoji.name.toLowerCase().includes(name);
		});

		if (!emojis.size) {
			return message.channel.send('I can\'t find any emojis with that name!');
		}

		let response = '';
		const hasEmbedPerms = message.guild.me.permissionsIn(message.channel).has('EMBED_LINKS');
		const inviteText = `If you want an invite to any of these servers, use the \`${prefix}server\` command!`;

		if (!hasEmbedPerms || emojis.size <= (25 / 3)) {
			const embed = new MessageEmbed()
				.setColor(colors.misc)
				.setDescription(inviteText);

			for (const emoji of emojis.values()) {
				embed
					.addField('Name', emoji.name, true)
					.addField('Emoji', emoji.toString(), true)
					.addField('Found in', emoji.guild.name, true);
			}

			response = { embed };
		}
		else {
			const content = [`${inviteText}\n`];

			for (const emoji of emojis.values()) {
				content.push(`${emoji.name}: ${emoji} (Found in **${emoji.guild.name}**)`);
			}

			response = { content: content.join('\n') };
		}

		return message.channel.send(response);
	},
};

module.exports = emojiSearch;
