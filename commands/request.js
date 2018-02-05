const snekfetch = require('snekfetch');

const Poll = require('../controllers/PollController');
const GuildManager = require('../controllers/GuildManagerController');
const RequestParser = require('../controllers/RequestParserController');

const { prefix } = require('../config');

const request = {
	name: 'request',
	description: 'Make a request for a new emoji to be added!',
	aliases: ['add', 'vote', 'poll'],
	usage: '<name or emoji> [url, emoji, or file]',
	requiresInit: true,
	async execute(message, args) {
		if (!args.length) {
			return message.reply([
				'you need to provide an emoji, a name and an emoji, a name and an image URL, or a name and an image file!',
				`For example: \`${prefix}request rinon https://i.imgur.com/7QeCxca.jpg\`.`,
			]);
		}

		try {
			args = RequestParser.parse(message, args);
		}
		catch (error) {
			return message.reply(error.message);
		}

		try {
			GuildManager.checkEmojiAmount(message.guild, args[1]);
		}
		catch (error) {
			return message.reply(error.message);
		}

		const response = await snekfetch.get(args[1]).catch(error => error);

		if (!response.ok) {
			return message.reply('that image link doesn\'t seem to be working.');
		}
		else if (response.headers['content-length'] > (256 * 1000)) {
			return message.reply('that file surpasses the 256kb file size limit! Please resize it and try again.');
		}

		return Poll.create(message, args);
	},
};

module.exports = request;
