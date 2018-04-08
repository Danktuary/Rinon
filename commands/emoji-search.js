const { MessageEmbed } = require('discord.js');

const RequestTransformer = require('../controllers/RequestTransformerController');

const { colors, prefix } = require('../config');

const wordsOnlyRegex = /^\w+$/;
const emojiRegex = /<(a)?:(\w+):(\d+)>/;

const emojiSearch = {
	name: 'emoji-search',
	description: 'Search for an emoji across all servers by name!',
	aliases: ['emojisearch', 'emoji', 'search'],
	usage: '<name>',
	async execute(message, [name]) {
		if (!name || name.length < 2) {
			return message.reply('a search term must be at least 2 characters long!');
		}

		try {
			name = this.transformInput(name);
		}
		catch (error) {
			return message.reply(error.message);
		}

		const emojis = message.client.emojis.filter(emoji => {
			return emoji.name.toLowerCase().includes(name);
		});

		if (!emojis.size) {
			return message.channel.send('I couldn\'t find any emojis with that name!');
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

			response = { content: content.join('\n'), split: '\n' };
		}

		return message.channel.send(response);
	},
	/**
	 * @todo Try to decrease the amount of code dupe here
	 */
	transformInput(name) {
		if (emojiRegex.test(name)) {
			const [transformedName] = RequestTransformer.fromEmoji(name);
			return transformedName.toLowerCase();
		}

		if (/^:\w+:$/.test(name)) {
			name = name.replace(/:/g, '');
		}

		if (!wordsOnlyRegex.test(name)) {
			throw new Error('only alphanumeric characters are allowed!');
		}

		return name.toLowerCase();
	},
};

module.exports = emojiSearch;
