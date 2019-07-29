const { RichEmbed } = require('discord.js');
const { Command } = require('discord-akairo');
const { colors, prefix } = require('../config.js');
const emojiUtil = require('../util/emoji.js');
const parseInput = require('../util/parseInput.js');
const regexes = require('../util/regexes.js');

module.exports = class EmojiSearchCommand extends Command {
	constructor() {
		super('emoji-search', {
			aliases: ['emoji-search', 'emoji', 'emote', 'search'],
			args: [{ id: 'name' }],
		});
	}

	async exec(message, { name }) {
		if (!name || name.length < 2) {
			return message.util.send('A search term must be at least 2 characters long!');
		}

		try {
			const emojis = emojiUtil.search(message.client.emojis, this.parseQuery(name));
			return message.util.send(...this.formatResponse(emojis));
		} catch (error) {
			return message.util.send(error.message);
		}
	}

	formatResponse(emojis) {
		const inviteText = `If you want an invite to any of these servers, use the \`${prefix}server\` command!`;

		if (emojis.size <= (25 / 3)) {
			const embed = new RichEmbed().setColor(colors.misc).setDescription(inviteText);

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

	parseQuery(name) {
		if (regexes.emoji.test(name)) {
			return parseInput.fromEmoji(name).name.toLowerCase();
		}

		if (/^:\w+:$/.test(name)) name = name.replace(/:/g, '');

		if (!regexes.wordsOnly.test(name)) {
			throw new Error('only alphanumeric characters are allowed!');
		}

		return name.toLowerCase();
	}
};
