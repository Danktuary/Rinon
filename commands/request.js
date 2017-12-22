const { get } = require('snekfetch');

const Poll = require('../controllers/PollController');

const { prefix } = require('../config');

const request = {
	name: 'request',
	description: 'Make a request for a new emoji to be added!',
	aliases: ['add', 'vote', 'poll'],
	usage: '<name> <url>',
	requiresInit: true,
	async execute(message, [name, url]) {
		if (message.guild.emojis.size === 50) {
			return message.reply([
				'it seems like I can\'t add any more emojis to this server.',
				`Want to check the other servers I\'m in? Use the \`${prefix}server\` command!`,
			].join('\n'));
		}

		if (!name && !url) {
			return message.reply([
				'you need to provide either an emoji, a name and an image URL, or a name and an emoji!',
				`For example: \`${prefix}request rinon https://i.imgur.com/7QeCxca.jpg\`.`,
			]);
		}

		// not my URL regex; find a better one later
		const emojiRegex = /<a?:\w+:(\d+)>/;
		const urlRegex = /(https?:\/\/)?(www.)?[^\s<>#%{}|\^~\[\]]+\.(png|jpg|jpeg|webp|gif)$/;

		if (emojiRegex.test(name)) {
			return message.channel.send('Emoji was sent first.');
		}

		if (!/^\w+$/.test(name)) {
			return message.reply('only alphanumeric characters are allowed!');
		}

		if (emojiRegex.test(url)) {
			url = `https://cdn.discordapp.com/emojis/${url.replace(/<:\w+:|>/g, '')}.png`;
		}

		if (!urlRegex.test(url)) {
			return message.reply('that doesn\'t seem like a valid image URL.');
		}

		const response = await get(url).catch(error => error);
		if (!response.ok) return message.reply('that image link doesn\'t seem to work properly.');

		return Poll.create(message, [name, url]);
	},
};

module.exports = request;
