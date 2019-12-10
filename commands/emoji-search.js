const { RichEmbed } = require('discord.js');
const { Command } = require('discord-akairo');
const { colors, prefix } = require('../config.js');
const emojiUtil = require('../util/emoji.js');

module.exports = class EmojiSearchCommand extends Command {
	constructor() {
		super('emoji-search', {
			aliases: ['emoji-search', 'emoji', 'emote', 'search'],
			description: 'Find a list of emojis based on your search query.',
			args: [{ id: 'name' }],
		});
	}

	async exec(message, { name }) {
		if (!name || name.length < 2 || name.length > 32) {
			return message.util.send('A search term needs to be between 2 and 32 characters long.');
		}

		try {
			const emojis = emojiUtil.search(message.client.emojis, emojiUtil.parseSearchQuery(name));
			return message.util.send(...this.formatResponse(emojis));
		} catch (error) {
			return message.util.send(error.message);
		}
	}

	formatResponse(emojis) {
		const inviteText = `If you want an invite to any of these servers, use the \`${prefix}server\` command!`;

		if (emojis.size <= (25 / 3)) {
			const embed = new RichEmbed().setColor(colors.pink).setDescription(inviteText);

			for (const emoji of emojis.values()) {
				embed
					.addField('Name', emoji.name, true)
					.addField('Emoji', emoji.toString(), true)
					.addField('Found in', emoji.guild.name, true);
			}

			return [{ embed }];
		}

		const content = [`${inviteText}\n`];

		for (const emoji of emojis.values()) {
			content.push(`${emoji.name}: ${emoji} (Found in **${emoji.guild.name}**)`);
		}

		return [content.join('\n'), { split: '\n' }];
	}
};
