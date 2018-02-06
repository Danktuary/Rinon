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
			].join('\n'));
		}

		try {
			args = RequestParser.parse(message, args);
			GuildManager.checkEmojiAmount(message.guild, args[1]);
		}
		catch (error) {
			return message.reply(error.message);
		}

		const imageData = await snekfetch.get(args[1]).catch(error => error);

		if (!imageData.ok) {
			return message.reply('that image link doesn\'t seem to be working.');
		}
		else if (imageData.headers['content-length'] > (256 * 1000)) {
			return message.reply('that file surpasses the 256kb file size limit! Please resize it and try again.');
		}

		const duplicatedEmojis = message.client.emojis.filter(emoji => {
			return args[0].toLowerCase() === emoji.name.toLowerCase();
		});

		if (duplicatedEmojis.size) {
			try {
				await message.reply([
					'It seems like I have other emojis with that same name!\n',
					'Does your request match any of the following emojis: ',
					duplicatedEmojis.map(emoji => emoji.toString()).join(' '),
					'\nIf so, would you like to cancel your request?',
				].join(''));

				const filter = m => ['yes', 'y', 'no', 'n'].includes(m.content.toLowerCase());
				const options = { max: 1, time: 15000, errors: ['time'] };

				const response = await message.channel.awaitMessages(filter, options)
					.then(responses => responses.first().content);

				if (['yes', 'y'].includes(response.toLowerCase())) {
					return message.channel.send('Got it; I\'ve cancelled your request.');
				}
				else {
					await message.channel.send('Got it; I\'ll continue on with your original request.');
				}
			}
			catch (error) {
				await message.reply('you didn\'t reply in time; I\'ll continue on with your original request.');
			}
		}

		return Poll.create(message, args);
	},
};

module.exports = request;
