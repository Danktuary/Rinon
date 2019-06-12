const { Command } = require('discord-akairo');
const snekfetch = require('snekfetch');
const Poll = require('../core/poll.js');
const transformInput = require('../util/transformInput.js');
const guildUtil = require('../util/guild.js');
const validators = require('../util/validators.js');

module.exports = class AddCommand extends Command {
	constructor() {
		super('add', {
			aliases: ['add', 'request', 'vote', 'poll'],
			channel: 'guild',
			args: [
				{
					id: 'name',
					type: 'string',
				},
				{
					id: 'url',
					type: 'string',
				},
			],
		});
	}

	async exec(message, args) {
		try {
			const { name, url } = await this.validate(message, args);
			await Poll.create(message, { name, url });
		} catch (error) {
			return message.channel.send(error.message || error);
		}
	}

	async validate(message, { name, url }) {
		if (!name && !url) {
			throw new Error([
				'You need to provide: an emoji, a name and an emoji, a name and an image URL, or a name and an image file!',
				`For example: \`${this.handler.prefix()}add AiSmug https://i.imgur.com/8jGJzmd.png\`.`,
			].join('\n'));
		}

		const { name: emojiName, url: imageURL } = transformInput({ name, url }, message.attachments);

		guildUtil.checkEmojiAmounts(message.guild, imageURL);

		if (emojiName.length < 2 || emojiName.length > 32) {
			throw new RangeError('An emoji name needs to be between 2 and 32 characters long.');
		}

		const imageData = await snekfetch.get(imageURL);

		if (!imageData.ok) {
			throw new Error('That image link doesn\'t seem to be working.');
		} else if (imageData.headers['content-length'] > (256 * 1024)) {
			throw new RangeError('That file surpasses the 256kb file size limit! Please resize it and try again.');
		}

		if (validators.regexes.blobInit.test(emojiName) && !validators.regexes.blob.test(emojiName)) {
			validators.blobs(emojiName, imageURL, imageData);
		}

		await validators.duplicates(message, emojiName);

		return { name: emojiName, url: imageURL };
	}
};
