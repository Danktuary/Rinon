const { RichEmbed } = require('discord.js');
const { Command } = require('discord-akairo');
const { colors } = require('../config.js');
const emojiUtil = require('../util/emoji.js');

module.exports = class EmojiSearchCommand extends Command {
	constructor() {
		super('emoji-search', {
			aliases: ['emoji-search', 'emoji', 'emote', 'search'],
			description: 'Find a list of emojis based on your search query.',
			args: [
				{
					id: 'query',
					prompt: {
						start: () => 'what emoji would you like to search for?',
						retry: () => 'That\'s not a valid search term! Please send the emoji or an emoji name you\'d like to search for.',
					},
				},
			],
			options: {
				help: {
					examples: ['EmojiName', ':emoji:'],
				},
			},
		});
	}

	async exec(message, { query }) {
		const searchTerm = emojiUtil.parseSearchQuery(query);

		if (searchTerm.length < 2 || searchTerm.length > 32) {
			return message.util.send('A search term needs to be between 2 and 32 characters long.');
		}

		const emojis = emojiUtil.search(message.client.emojis, searchTerm);
		if (!emojis.size) return message.util.send('I couldn\'t find any requests that match your search term!');
		return message.util.send(this.formatResponse(emojis));
	}

	formatResponse(emojis) {
		const inviteText = `If you want an invite to any of these servers, use the \`${this.handler.prefix}server\` command!`;

		if (emojis.size <= (25 / 3)) {
			const embed = new RichEmbed().setColor(colors.pink).setDescription(inviteText);

			for (const emoji of emojis.values()) {
				embed
					.addField('Name', emoji.name, true)
					.addField('Emoji', emoji.toString(), true)
					.addField('Found in', emoji.guild.name, true);
			}

			return { embed };
		}

		const content = [`${inviteText}\n`];

		for (const emoji of emojis.values()) {
			content.push(`${emoji.name}: ${emoji} (Found in **${emoji.guild.name}**)`);
		}

		return { content: content.join('\n'), split: '\n' };
	}
};
