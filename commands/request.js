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
			return message.reply(`you need to provide at least two values! The format would be \`${prefix}request <name> <url>\`.`);
		}

		// not mine; find a better one later
		const urlRegex = /(https?:\/\/)?(www.)?[^\s<>#%{}|\^~\[\]]+\.(png|jpg|jpeg|webp)$/;

		if (!/^\w+$/.test(name)) {
			return message.reply('only alphanumeric characters are allowed!');
		} else if (!urlRegex.test(url)) {
			return message.reply('that doesn\'t seem like a valid image URL.');
		}

		const resposne = await get(url).catch(error => error);
		if (!resposne.ok) return message.reply('that image link doesn\'t seem to work properly.');

		Poll.create(message, [name, url]);
	},
};

module.exports = request;
